/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * Measures update saml info successes and failures
 */
export interface WebCoreSSOSamlUpdateInfoTotal {
  Value: number;
  Labels: {
    status: "success" | "failure" | "4xx" | "5xx";
  };
}
