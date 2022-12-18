# CityCoins Protocol

## Introduction

CityCoins give communities the power to improve and program their cities.

## Code Management

### Code Formatting

The following will report and fix formatting issues;

```bash
npx prettier -c .
npx prettier --write .
```

### Test Code Coverage

Generate code coverage report;

```bash
clarinet test --coverage
cd coverage_report
genhtml ../coverage.lcov
```

The generated files are not committed to the repository (coverage_report is git ignored).

## Purpose

This repository contains the base contract for the DAO and any related extensions.

The base DAO and DAO extensions will first be used to deploy a smart contract treasury per city with stacking capabilities following a successful vote on the changes [in CCIP-012](https://github.com/citycoins/governance/blob/main/ccips/ccip-012/ccip-012-stabilize-emissions-and-treasuries.md).

Additional DAO extensions will be added for each part of the protocol (registration, mining, stacking) following a successful vote on the changes [in CCIP-013](https://github.com/citycoins/governance/blob/main/ccips/ccip-013/ccip-013-stabilize-protocol-and-simplify-contracts.md).

Upon completion of both CCIPs this repository will supersede the protocol contracts in [citycoins/contracts](https://github.com/citycoins/contracts).

## Contributions

All are welcome! Please get in touch via the [CityCoins Discord](https://chat.citycoins.co) or jump right in and submit a pull request.
