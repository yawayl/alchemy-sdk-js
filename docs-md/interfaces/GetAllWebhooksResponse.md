[alchemy-sdk](../README.md) / [Exports](../modules.md) / GetAllWebhooksResponse

# Interface: GetAllWebhooksResponse

The response for a [NotifyNamespace.getAllWebhooks](../classes/NotifyNamespace.md#getallwebhooks) method.

## Table of contents

### Properties

- [totalCount](GetAllWebhooksResponse.md#totalcount)
- [webhooks](GetAllWebhooksResponse.md#webhooks)

## Properties

### totalCount

• **totalCount**: `number`

The total number of webhooks.

#### Defined in

[src/types/types.ts:1115](https://github.com/alchemyplatform/alchemy-sdk-js/blob/70f9997/src/types/types.ts#L1115)

___

### webhooks

• **webhooks**: [`Webhook`](Webhook.md)[]

All webhooks attached to the provided auth token.

#### Defined in

[src/types/types.ts:1113](https://github.com/alchemyplatform/alchemy-sdk-js/blob/70f9997/src/types/types.ts#L1113)
