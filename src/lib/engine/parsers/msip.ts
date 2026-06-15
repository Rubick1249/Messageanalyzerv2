// Parses MSIP_Labels header (Microsoft Information Protection sensitivity labels).
// Format: MSIP_Label_<GUID>_Key=Value; MSIP_Label_<GUID>_Key=Value; ...

export interface MsipParsed {
  guid: string;
  enabled?: string;
  setDate?: string;
  method?: string;
  name?: string;
  siteId?: string;
  actionId?: string;
  contentBits?: string;
}

export function parseMsipLabels(value: string): MsipParsed | undefined {
  const parsed: MsipParsed = { guid: '' };

  // Extract GUID from the first token
  const guidMatch = /MSIP_Label_([0-9a-f-]{36})_/i.exec(value);
  if (!guidMatch) return undefined;
  parsed.guid = guidMatch[1];

  const extract = (key: string): string | undefined => {
    const re = new RegExp(`MSIP_Label_[0-9a-f-]{36}_${key}=([^;\\r\\n]+)`, 'i');
    return re.exec(value)?.[1]?.trim();
  };

  parsed.enabled    = extract('Enabled');
  parsed.setDate    = extract('SetDate');
  parsed.method     = extract('Method');
  parsed.name       = extract('Name');
  parsed.siteId     = extract('SiteId');
  parsed.actionId   = extract('ActionId');
  parsed.contentBits= extract('ContentBits');

  return parsed;
}
