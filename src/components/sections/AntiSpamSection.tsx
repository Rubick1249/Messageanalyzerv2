import type { AnalysisResult } from '@/lib/types';
import { FieldRow } from '../primitives/FieldRow';
import { TierBadge } from '../primitives/TierBadge';

interface Props {
  result: AnalysisResult;
}

export function AntiSpamSection({ result }: Props) {
  const { forefront, microsoftAntiSpam, mailboxDelivery } = result.antiSpam;
  const tierDFields = mailboxDelivery.filter(f => f.tier === 'D');
  const tierCFields = mailboxDelivery.filter(f => f.tier === 'C');

  return (
    <div className="space-y-6">
      {/* X-Forefront-Antispam-Report */}
      <div>
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
          X-Forefront-Antispam-Report
        </h3>
        <div className="divide-y divide-surface-border">
          {forefront.map((field, i) => (
            <FieldRow key={i} field={field} />
          ))}
        </div>
      </div>

      {/* X-Microsoft-Antispam */}
      {microsoftAntiSpam.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
            X-Microsoft-Antispam
          </h3>
          <div className="divide-y divide-surface-border">
            {microsoftAntiSpam.map((field, i) => (
              <FieldRow key={i} field={field} />
            ))}
          </div>
        </div>
      )}

      {/* Mailbox Delivery */}
      {mailboxDelivery.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">
            X-Microsoft-Antispam-Mailbox-Delivery
          </h3>
          <p className="text-xs text-text-tertiary mb-3">
            These fields describe the mailbox-level delivery decision — separate from the transport-level SCL/SFV verdict above.
            A message can be "not spam" at transport but still routed to Junk by mailbox rules or per-user settings.
          </p>

          {/* Tier C fields first */}
          {tierCFields.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <TierBadge tier="C" />
                <span className="text-xs text-text-tertiary">Community-interpreted fields</span>
              </div>
              <div className="divide-y divide-surface-border">
                {tierCFields.map((field, i) => (
                  <FieldRow key={i} field={field} />
                ))}
              </div>
            </div>
          )}

          {/* Tier D fields */}
          {tierDFields.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TierBadge tier="D" />
                <span className="text-xs text-text-tertiary">Undocumented Microsoft-internal fields — best-effort gloss only</span>
              </div>
              <div className="divide-y divide-surface-border">
                {tierDFields.map((field, i) => (
                  <FieldRow key={i} field={field} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
