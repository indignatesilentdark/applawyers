-- SQL limpiado a partir de lista generada por ChatGPT Work
-- Fuente dominante detectada: FSMA (Bélgica)

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Argentis Capora',
  'argentis capora',
  '[]'::jsonb,
  '["argentis-capora.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Claire Marchèòn',
  'claire marcheon',
  '[]'::jsonb,
  '["clairemarcheon.net"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Clarté Finelya',
  'clarte finelya',
  '[]'::jsonb,
  '["clartefinelyabe.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Effectenria',
  'effectenria',
  '[]'::jsonb,
  '["effectenria.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Fort Trésorique',
  'fort tresorique',
  '[]'::jsonb,
  '["fort-tresorique.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Libre Profitance',
  'libre profitance',
  '[]'::jsonb,
  '["ai-libreprofitance.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Mont Activoire',
  'mont activoire',
  '[]'::jsonb,
  '["montactivoire.org"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Riche Patrimesse',
  'riche patrimesse',
  '[]'::jsonb,
  '["riche-patrimesse.com","richepatrimesse-ai.com","richepatrimesse-be.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidades asociadas por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Track Cormax Hex',
  'track cormax hex',
  '[]'::jsonb,
  '["trackcormaxhex.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'X Trade Grok 8.1 Flex',
  'x trade grok 8.1 flex',
  '[]'::jsonb,
  '["xtradegrok-81-flex.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Bitelity',
  'bitelity',
  '[]'::jsonb,
  '["bitelity.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'BlitzPine Group',
  'blitzpine group',
  '["BlitzPine"]'::jsonb,
  '["area.bltzpn-gr.org","blitzpinegroup.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Blueforge Ltd',
  'blueforge ltd',
  '["Blueforge"]'::jsonb,
  '["cfd.blueforge.ltd"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'CDJ Rise',
  'cdj rise',
  '[]'::jsonb,
  '["cdjrise.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'DataEdgeFX',
  'dataedgefx',
  '["Data Edge FX"]'::jsonb,
  '["clientzone.dataedgefx.com","dataedgefx.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Dividenda',
  'dividenda',
  '[]'::jsonb,
  '["dividenda.finance","webtrader.dividenda.app"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Exovia Markets',
  'exovia markets',
  '[]'::jsonb,
  '["exovia-markets.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Markelio-global',
  'markelio-global',
  '["Markelio Global"]'::jsonb,
  '["markelio-global.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Noxi Rise',
  'noxi rise',
  '[]'::jsonb,
  '["noxirise.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Rivonsphere',
  'rivonsphere',
  '[]'::jsonb,
  '["rivonsphere.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Sirano Group (Clone)',
  'sirano group clone',
  '["Sirano Group"]'::jsonb,
  '["siranogroup.biz"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA por posible clon el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Solara Finance Limited',
  'solara finance limited',
  '["Solara Finance"]'::jsonb,
  '["solara-financelimited.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'SwayHorizonAI',
  'swayhorizonai',
  '["Sway Horizon AI"]'::jsonb,
  '["swayhorizonai.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Torvex Finance',
  'torvex finance',
  '[]'::jsonb,
  '["torvexfinance.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Winseterra',
  'winseterra',
  '[]'::jsonb,
  '["winseterra.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 30/06/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Blackrose Finbitnex',
  'blackrose finbitnex',
  '[]'::jsonb,
  '["blackrosefinbitnex.com","blackrose-finbitnex.com","blackrosefinbitnexai.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidades asociadas por la FSMA con plataformas fraudulentas el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Dexlink',
  'dexlink',
  '["Repère Dexlink"]'::jsonb,
  '["repere-dexlink.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'FlandrexBit',
  'flandrexbit',
  '["Flandrex Bit"]'::jsonb,
  '["flandrexbit.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad asociada por la FSMA con plataformas fraudulentas el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Fyronex Driftor GPT',
  'fyronex driftor gpt',
  '[]'::jsonb,
  '["fyronexdriftor-gpt.com","fyronexdriftor-gpt.net"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidades asociadas por la FSMA con plataformas fraudulentas el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Pagtrix AI',
  'pagtrix ai',
  '[]'::jsonb,
  '["neo-profit-ai.com","pagtrixaiapp.com","quantum-ai-trading.nl","qumasai.org"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidades asociadas por la FSMA con plataformas fraudulentas el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Blaxton',
  'blaxton',
  '["Blaxton Group"]'::jsonb,
  '["blaxtongroup.com","vc.blaxtongroup.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Cyrosalnix',
  'cyrosalnix',
  '[]'::jsonb,
  '["cyrosalnix.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'EQUITY T S PTY LTD (Clone)',
  'equity t s pty ltd clone',
  '["EQUITY T S PTY LTD"]'::jsonb,
  '["equityts.com","live.faralloncapitalgroup.investments","wayatrading.com","wayatrading.trade"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA por posible clon el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Fibovest',
  'fibovest',
  '[]'::jsonb,
  '["fibovest.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Fintrionyx Capital',
  'fintrionyx capital',
  '[]'::jsonb,
  '["fintrionyx-capital.co","webtrader.fintrionyx-capital.cx","fintrionyx-capital.fi","webtrader.fintrionyx-capital.ac"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'FTMX Global',
  'ftmx global',
  '[]'::jsonb,
  '["ftmxglobal.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Galveston Advisory (Clone)',
  'galveston advisory clone',
  '["Galveston Advisory"]'::jsonb,
  '["galvestonadvisory.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA por posible clon el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Glenstone Advisory (Clone)',
  'glenstone advisory clone',
  '["Glenstone Advisory"]'::jsonb,
  '["glenstoneadvisory.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA por posible clon el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Interactive Markets',
  'interactive markets',
  '[]'::jsonb,
  '["interactive-market.net"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'London Bridge',
  'london bridge',
  '[]'::jsonb,
  '["londonbridge.ai"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Luxenrise',
  'luxenrise',
  '[]'::jsonb,
  '["luxenrise.com","trading.luxenrise.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Monexahollding',
  'monexahollding',
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026; dominio no publicado.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'NeoWaySolution',
  'neowaysolution',
  '["Neo Way Solution"]'::jsonb,
  '["neowaysolution.net"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Picktan Capital (Clone)',
  'picktan capital clone',
  '["Picktan Capital"]'::jsonb,
  '["picktancapital.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA por posible clon el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Primeber Group',
  'primeber group',
  '[]'::jsonb,
  '["primebergroup.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'ProTradeAlliance',
  'protradealliance',
  '["Pro Trade Alliance"]'::jsonb,
  '["protradealliance.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Quantoria Markets',
  'quantoria markets',
  '[]'::jsonb,
  '["quantoria-markets.net"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Richmond Terrace Capital (Clone)',
  'richmond terrace capital clone',
  '["Richmond Terrace Capital"]'::jsonb,
  '["richmondterracecapital.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA por posible clon el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'Signal-Markets',
  'signal-markets',
  '["Signal Markets"]'::jsonb,
  '["signal-markets.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
(
  'TheAdvisorSynergy',
  'theadvisorsynergy',
  '["The Advisor Synergy"]'::jsonb,
  '["theadvisorsynergy.com"]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  'Bélgica',
  'alto',
  'reportado',
  'regulatory_warning',
  'Entidad incluida en advertencia pública de la FSMA el 12/03/2026.'
)
on conflict (normalized_name)
do update set
  aliases = excluded.aliases,
  domains = excluded.domains,
  emails = excluded.emails,
  phones = excluded.phones,
  country = excluded.country,
  risk_level = excluded.risk_level,
  status = excluded.status,
  source_type = excluded.source_type,
  source_note = excluded.source_note,
  updated_at = timezone('utc', now());

