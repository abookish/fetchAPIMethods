/* eslint-disable max-len */
import URI from 'uri-js';

// defines a uri string arg of an object with atttribute value pairs
export function getURI(recordsEndPoint, optionsObject) {
  const defaultLimit = 10;
  const uri = new URI(recordsEndPoint);

  const limit = optionsObject?.limit ? optionsObject?.limit : defaultLimit;
  uri.addQuery('limit', limit.toString());
  // iterate through any entries to query string for attribute value
  if (Object.entries(optionsObject?.length > 0)) {
    // eslint-disable-next-line no-restricted-syntax
    for (const [attributeName, expectedValue] of Object.entries(optionsObject)) {
      uri.addQuery(attributeName.toString(), expectedValue.toString());
    }
  }
  return uri;
}

// eslint-disable-next-line consistent-return
export async function fetchDataJson(recordsEndPoint, optionsObject = null) {
  try {
    const response = await fetch(getURI(recordsEndPoint, optionsObject));
    if (!response.ok) {
      console.log(`error in fetch with ${response.statusText}`);
      throw new Error(response);
    } const json = await response.json();
    return json;
  } catch (error) {
    console.log(`Error fetching data: ${error.message}`);
  }
}

export async function fetchResultIsValid(recordsEndPoint, optionsObject) {
  const fetchPayload = await fetchDataJson(recordsEndPoint, optionsObject);
  return fetchPayload?.length > 0;
}
export async function cloneObjectAddAttribute(optionsObject, attributeName, attributeValue) {
  if (!optionsObject) { // if nothing passed in, handle by making new obj
    const newObj = {};
    newObj[attributeName] = attributeValue;
    return newObj;
  }
  const clone = structuredClone(optionsObject);
  clone[attributeName] = [attributeValue];
  return clone;
}
export async function getAlternateAttributesWithValidData(optionsObject, newAttributesObject) {
  // runs alternate fetch on a copy of object with passed in attribute, or adding attribute/value
  // if fetch payload includes results, store attribute and value pair
  const attributeValueWithResults = {

  };
  async function setAttributesForValidResults(attributeName, attributeValue) {
    const optionsWithNewAttribute = await cloneObjectAddAttribute(optionsObject, attributeValue);
    if (await fetchResultIsValid(optionsWithNewAttribute)) {
      attributeValueWithResults[attributeName] = attributeValue;
    }
  }
  if (Object.entries(newAttributesObject)?.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for await (const [attributeName, expectedValue] of Object.entries(optionsObject)) {
      await setAttributesForValidResults([attributeName, expectedValue]);
    }
  }

  return attributeValueWithResults;
}
// filterOptionsArray expects array of objs with keys: attribute, filter characteristic
export async function getDataAttributes(fetchPayloadJson, filterOptionsArray) {
  const dataAttributes = {
    // store fetched objects taht match the key/value of the filterOptions array

  };
  if (fetchPayloadJson?.length > 0 && filterOptionsArray?.length > 0) {
    // eslint-disable-next-line no-restricted-syntax
    for await (const filterOptionsObject of filterOptionsArray) {
      if (Object.entries(filterOptionsObject).length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for await (const [name, value] of Object.entries(filterOptionsObject)) {
          const key = `${name}${value.toString()}`;
          dataAttributes[key] = await fetchPayloadJson?.filter((obj) => obj[name] === value);
        }
      }
    }
  }

  return dataAttributes;
}

// eslint-disable-next-line max-len
async function transformFetchPayloadJson(fetchPayloadJson, optionsObject, filterOptionsArray = null, newAttributesObject = null) {
  const returnObj = {};
  const validAlternateAttributes = await getAlternateAttributesWithValidData(optionsObject, newAttributesObject);
  const dataAttributes = await getDataAttributes(fetchPayloadJson, filterOptionsArray);

  Object.assign(returnObj, dataAttributes, validAlternateAttributes);

  return returnObj;
}

// eslint-disable-next-line no-unused-vars
async function retrieveAndTransform(optionsObject, filterOptionsArray = null, newAttributesObject = null) {
  const response = await fetchDataJson(optionsObject);
  const transformed = await transformFetchPayloadJson(response, optionsObject, filterOptionsArray, newAttributesObject);
  return transformed;
}
