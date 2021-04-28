export type SignaturePolicyType = {
    /**
     * On the producing side:
     * * Build messages with the signature, key (from may be enough for certain inlineable public key types), from and seqno fields.
     *
     * On the consuming side:
     * * Enforce the fields to be present, reject otherwise.
     * * Propagate only if the fields are valid and signature can be verified, reject otherwise.
     */
    StrictSign: "StrictSign";
    /**
     * On the producing side:
     * * Build messages without the signature, key, from and seqno fields.
     * * The corresponding protobuf key-value pairs are absent from the marshalled message, not just empty.
     *
     * On the consuming side:
     * * Enforce the fields to be absent, reject otherwise.
     * * Propagate only if the fields are absent, reject otherwise.
     * * A message_id function will not be able to use the above fields, and should instead rely on the data field. A commonplace strategy is to calculate a hash.
     */
    StrictNoSign: "StrictNoSign";
}[keyof {
    /**
     * On the producing side:
     * * Build messages with the signature, key (from may be enough for certain inlineable public key types), from and seqno fields.
     *
     * On the consuming side:
     * * Enforce the fields to be present, reject otherwise.
     * * Propagate only if the fields are valid and signature can be verified, reject otherwise.
     */
    StrictSign: "StrictSign";
    /**
     * On the producing side:
     * * Build messages without the signature, key, from and seqno fields.
     * * The corresponding protobuf key-value pairs are absent from the marshalled message, not just empty.
     *
     * On the consuming side:
     * * Enforce the fields to be absent, reject otherwise.
     * * Propagate only if the fields are absent, reject otherwise.
     * * A message_id function will not be able to use the above fields, and should instead rely on the data field. A commonplace strategy is to calculate a hash.
     */
    StrictNoSign: "StrictNoSign";
}];
export namespace SignaturePolicy {
    const StrictSign: 'StrictSign';
    const StrictNoSign: 'StrictNoSign';
}
//# sourceMappingURL=signature-policy.d.ts.map