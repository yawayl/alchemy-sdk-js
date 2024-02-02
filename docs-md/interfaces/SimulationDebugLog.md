[alchemy-sdk](../README.md) / [Exports](../modules.md) / SimulationDebugLog

# Interface: SimulationDebugLog

Debug log in a [SimulateExecutionResponse](SimulateExecutionResponse.md).

## Table of contents

### Properties

- [address](SimulationDebugLog.md#address)
- [data](SimulationDebugLog.md#data)
- [decoded](SimulationDebugLog.md#decoded)
- [topics](SimulationDebugLog.md#topics)

## Properties

### address

• **address**: `string`

The address of the contract that generated the log.

#### Defined in

[src/types/types.ts:944](https://github.com/alchemyplatform/alchemy-sdk-js/blob/70f9997/src/types/types.ts#L944)

___

### data

• **data**: `string`

The data included the log.

#### Defined in

[src/types/types.ts:946](https://github.com/alchemyplatform/alchemy-sdk-js/blob/70f9997/src/types/types.ts#L946)

___

### decoded

• `Optional` **decoded**: [`DecodedLog`](DecodedLog.md)

A decoded version of the log. Provided on a best-effort basis.

#### Defined in

[src/types/types.ts:948](https://github.com/alchemyplatform/alchemy-sdk-js/blob/70f9997/src/types/types.ts#L948)

___

### topics

• **topics**: `string`[]

An array of topics in the log.

#### Defined in

[src/types/types.ts:942](https://github.com/alchemyplatform/alchemy-sdk-js/blob/70f9997/src/types/types.ts#L942)
