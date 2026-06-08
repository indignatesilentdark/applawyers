import { env } from "@/lib/env";
import type {
  BlockchainCounterparty,
  BlockchainInvestigationResult,
  InvestigationSource,
} from "@/lib/types";
import {
  createSource,
  DEFAULT_NOTE_NO_VERIFICATION,
  fetchJsonWithTimeout,
  nowIso,
} from "@/lib/investigation/shared";

type BlockchainInput = {
  network?: string | null;
  transactionHash?: string | null;
  walletAddress?: string | null;
};

type ExplorerConfig = {
  apiKey?: string;
  apiUrl: string;
  label: BlockchainInvestigationResult["detectedNetwork"];
};

type ExplorerTx = {
  from?: string;
  input?: string;
  isError?: string;
  timeStamp?: string;
  to?: string;
  value?: string;
};

const NETWORKS: Record<string, ExplorerConfig> = {
  arbitrum: {
    apiUrl: "https://api.arbiscan.io/api",
    label: "Arbitrum",
  },
  bsc: {
    apiKey: env.bscScanApiKey,
    apiUrl: "https://api.bscscan.com/api",
    label: "BSC",
  },
  ethereum: {
    apiKey: env.etherscanApiKey,
    apiUrl: "https://api.etherscan.io/api",
    label: "Ethereum",
  },
  optimism: {
    apiUrl: "https://api-optimistic.etherscan.io/api",
    label: "Optimism",
  },
  polygon: {
    apiKey: env.polygonScanApiKey,
    apiUrl: "https://api.polygonscan.com/api",
    label: "Polygon",
  },
};

function validateWalletAddress(value?: string | null) {
  if (!value) {
    return false;
  }

  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

function validateTransactionHash(value?: string | null) {
  if (!value) {
    return false;
  }

  return /^0x[a-fA-F0-9]{64}$/.test(value.trim());
}

function detectNetwork(input: BlockchainInput) {
  const normalized = input.network?.toLowerCase().trim();
  if (normalized && normalized in NETWORKS) {
    return NETWORKS[normalized];
  }

  if (validateWalletAddress(input.walletAddress) || validateTransactionHash(input.transactionHash)) {
    return NETWORKS.ethereum;
  }

  return null;
}

function parseNativeValue(raw?: string) {
  if (!raw) {
    return 0;
  }

  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return numeric / 1e18;
}

function collectCounterparties(
  transactions: ExplorerTx[],
  mode: "inbound" | "outbound",
) {
  const map = new Map<string, BlockchainCounterparty>();

  for (const tx of transactions) {
    const address = (mode === "inbound" ? tx.from : tx.to)?.toLowerCase();
    if (!address) {
      continue;
    }

    const current = map.get(address) ?? {
      address,
      count: 0,
      totalValueNative: 0,
    };

    current.count += 1;
    current.totalValueNative += parseNativeValue(tx.value);
    map.set(address, current);
  }

  return Array.from(map.values())
    .sort((left, right) => right.count - left.count || right.totalValueNative - left.totalValueNative)
    .slice(0, 5);
}

export async function investigateBlockchain({
  network,
  transactionHash,
  walletAddress,
}: BlockchainInput): Promise<BlockchainInvestigationResult> {
  const normalizedWallet = walletAddress?.trim() || null;
  const normalizedHash = transactionHash?.trim() || null;
  const detectedConfig = detectNetwork({ network, transactionHash, walletAddress });
  const sources: InvestigationSource[] = [];

  const baseResult: BlockchainInvestigationResult = {
    confidenceScore: 18,
    contractInteractionDetected: false,
    detectedNetwork: detectedConfig?.label ?? "No verificado",
    firstTransactionAt: null,
    hashStatus: normalizedHash
      ? validateTransactionHash(normalizedHash)
        ? "Válido"
        : "Inválido"
      : "No verificado",
    knownExchange: null,
    lastTransactionAt: null,
    notes: [],
    primaryInboundWallets: [],
    primaryOutboundWallets: [],
    sources,
    totalMovedNative: null,
    traceabilityLevel: "Baja",
    traceabilityReasons: [
      "No se completo una consulta externa verificable para la wallet o hash reportado.",
    ],
    transactionCount: 0,
    transactionHash: normalizedHash,
    walletAddress: normalizedWallet,
    walletStatus: normalizedWallet
      ? validateWalletAddress(normalizedWallet)
        ? "Válida"
        : "Inválida"
      : "No verificado",
  };

  if (!normalizedWallet && !normalizedHash) {
    sources.push(
      createSource("Entrada blockchain", "requires_human_review", {
        note: "No se recibieron wallet ni hash para analizar.",
      }),
    );
    baseResult.notes.push("Requiere revisión humana: no se ingresó wallet ni hash.");
    return baseResult;
  }

  if (!detectedConfig?.apiKey) {
    sources.push(
      createSource(detectedConfig?.label ?? "Blockchain", "not_verified", {
        note: DEFAULT_NOTE_NO_VERIFICATION,
      }),
    );

    if (baseResult.walletStatus === "Válida") {
      baseResult.notes.push("La wallet tiene formato compatible, pero no fue consultada en explorador.");
      baseResult.traceabilityReasons = [
        "La dirección parece válida, pero no se pudo verificar actividad on-chain con una fuente conectada.",
      ];
    }

    return baseResult;
  }

  if (!normalizedWallet || baseResult.walletStatus !== "Válida") {
    sources.push(
      createSource(detectedConfig.label, "requires_human_review", {
        note: "La wallet no tiene un formato válido para consulta automatizada.",
      }),
    );
    baseResult.notes.push("La wallet reportada no pudo ser validada para analisis automatizado.");
    return baseResult;
  }

  const query = new URL(detectedConfig.apiUrl);
  query.searchParams.set("module", "account");
  query.searchParams.set("action", "txlist");
  query.searchParams.set("address", normalizedWallet);
  query.searchParams.set("sort", "asc");
  query.searchParams.set("apikey", detectedConfig.apiKey);

  try {
    const payload = await fetchJsonWithTimeout<{
      message?: string;
      result?: ExplorerTx[] | string;
      status?: string;
    }>(query.toString());
    const txs = Array.isArray(payload.result) ? payload.result : [];

    sources.push(
      createSource(`${detectedConfig.label} Explorer`, "verified", {
        url: query.toString().replace(detectedConfig.apiKey, "redacted"),
      }),
    );

    if (!txs.length) {
      baseResult.notes.push("No se encontraron transacciones en la consulta realizada.");
      baseResult.traceabilityReasons = [
        "La direccion fue consultada, pero no hubo actividad visible en la fuente utilizada.",
      ];
      return {
        ...baseResult,
        confidenceScore: 42,
      };
    }

    const first = txs[0];
    const last = txs[txs.length - 1];
    const contractInteractionDetected = txs.some(
      (tx) => typeof tx.input === "string" && tx.input !== "0x",
    );
    const totalMovedNative = txs.reduce(
      (sum, tx) => sum + parseNativeValue(tx.value),
      0,
    );
    const outbound = collectCounterparties(
      txs.filter((tx) => tx.from?.toLowerCase() === normalizedWallet.toLowerCase()),
      "outbound",
    );
    const inbound = collectCounterparties(
      txs.filter((tx) => tx.to?.toLowerCase() === normalizedWallet.toLowerCase()),
      "inbound",
    );

    const traceabilityLevel =
      txs.length <= 10 ? "Alta" : txs.length <= 40 ? "Media" : "Baja";
    const traceabilityReasons = [
      `Se encontraron ${txs.length} transacciones visibles a profundidad 1.`,
      contractInteractionDetected
        ? "Hay interaccion con contratos, lo que incrementa complejidad de seguimiento."
        : "No se detecto interaccion contractual directa en esta consulta inicial.",
    ];

    return {
      ...baseResult,
      confidenceScore: 78,
      contractInteractionDetected,
      firstTransactionAt: first?.timeStamp
        ? new Date(Number(first.timeStamp) * 1000).toISOString()
        : null,
      lastTransactionAt: last?.timeStamp
        ? new Date(Number(last.timeStamp) * 1000).toISOString()
        : null,
      notes: [
        `Consulta realizada el ${nowIso()}.`,
        payload.message ? `Respuesta del explorador: ${payload.message}.` : "",
      ].filter(Boolean),
      primaryInboundWallets: inbound,
      primaryOutboundWallets: outbound,
      totalMovedNative: Number(totalMovedNative.toFixed(6)),
      traceabilityLevel,
      traceabilityReasons,
      transactionCount: txs.length,
    };
  } catch (error) {
    sources.push(
      createSource(`${detectedConfig.label} Explorer`, "source_unavailable", {
        note:
          error instanceof Error
            ? error.message
            : "Fuente no disponible temporalmente.",
      }),
    );

    return {
      ...baseResult,
      notes: ["Fuente no disponible. Requiere revisión humana."],
      traceabilityReasons: [
        "La fuente blockchain no respondio durante la consulta automatizada.",
      ],
    };
  }
}
