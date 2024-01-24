import URI from 'urijs';

// /records endpoint
window.path = 'http://localhost:3000';


 // defines a uri string arg of an object with atttribute value pairs
const getURI = (optionsObject) => {
 const defaultNumItems = 10;
  const uri = new URI(window.path);
  uri.addQuery('limit', defaultNumItems.toString());
//iterate through any entries to query string for attribute value
  if (Object.entries(optionsObject.length > 0)) {
    for (const [attributeName, expectedValue] of Object.entries(optionsObject)){
      uri.addQuery(attributeName.toString(), expectedValue.toString());
  }
}
  return uri;
};

// eslint-disable-next-line consistent-return
async function fetchDataJson(optionsObject) {
  try {
    const response = await fetch(getURI(optionsObject));
    if (!response.ok) {
      console.log(`error in fetch with ${response.statusText}`);
      throw new Error(response);
    } const json = await response.json();
    return json;
  } catch (error) {
    console.log(`Error fetching data: ${error.message}`);
  }
}

async function fetchResultIsValid(optionsObject) {
  const fetchPayload = await fetchDataJson(optionsObject);
  return fetchPayload?.length > 0;
}
async function cloneObjectWithNewAttribute(optionsObject, attributeName, attributeValue) {
  if (!optionsObject) { // if nothing passed in, handle by making new obj
    const newObj = {};
    newObj[attributeName] = attributeValue;
    return newObj;
  }
  const clone = structuredClone(optionsObject);
  clone.page = newPageValue;
  return clone;
}
async function getAlternateOptionsAttributesWithValidData(optionsObject, newAttributesObject) {
  //runs alternate fetch on a copy of object with a changed value of the passed in attribute, or adding attribute/value 
  //if fetch payload includes results, store attribute and value pair
  const attributeValueWithResults = {
  
  };
  async function setAttributesForValidResults(attributeName, attributeValue) {
    const optionsWithNewAttribute = await cloneObjectWithNewAttribute(optionsObject, attributeValue);
    if (await fetchResultIsValid(optionsWithNewAttribute)) { attributesWithResults[attributeName] = attributeValue; }
  }
  if(Object.entries(newAttributesObject)?.length > 0) {
    for (const [attributeName, expectedValue] of Object.entries(optionsObject)){
      await setAttributesForValidResults([attributeName, expectedValue])
  }
}

  return attributeValueWithResults;
}
// filterOptionsArray expects array of objs with keys: attribute, filter characteristic 
async function getDataAttributes(fetchPayloadJson, filterOptionsArray) {
  const dataAttributes = {
    
  };
  if (fetchPayloadJson?.length > 0 && filterOptionsArray?.length >0) {
    for (const filterOptionsObject of filterOptionsArray) {
      if (Object.entries(filterOptionsObject).length >0) {
        for (const [attributeName, expectedValue] of Object.entries(filterOptionsObject)) {
          const dataAttributesKey = `${attributeName}${expectedValue.toString()}`
          dataAttributes[dataAttributesKey] =  await fetchPayloadJson?.filter((eachObj) => eachObj[attributeName] === expectedValue)
        }
      }
    }
    };
    
  return dataAttributes;
}

async function transformFetchPayloadJson(fetchPayloadJson, optionsObject, filterOptionsArray = null, newAttributesObject = null) {
  const returnObj = {};
  const validAlternateAttributes = await getAlternateOptionsAttributesWithValidData(optionsObject, newAttributesObject);
  const dataAttributes = await getDataAttributes(fetchPayloadJson, filterOptionsArray);

  Object.assign(returnObj, dataAttributes, validAlternateAttributes);

  return returnObj;
}

async function retrieveAndTransform(optionsObject, filterOptionsArray = null, newAttributesObject = null) {
  const response = await fetchDataJson(optionsObject);
  const transformed = await transformFetchPayloadJson(response, optionsObject, filterOptionsArray, newAttributesObject);
  return transformed;
}

export default retrieveAndTransform;
