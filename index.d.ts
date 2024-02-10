
declare module "fetchapimethods" {
    // defines a uri string arg of an object with atttribute value pairs
    function getURI(recordsEndPoint: string, optionsObject: Object | undefined): string
    
    
    interface apiResponse {
      data: any
    }
    // eslint-disable-next-line consistent-return
    function fetchDataJson(recordsEndPoint:string, optionsObject: Object |undefined): Promise<apiResponse | undefined>
    
    function fetchResultIsValid(recordsEndPoint: string, optionsObject: Object | undefined): Promise<boolean>
    function cloneObjectAddAttribute(optionsObject: Object | undefined, attributeName: String, attributeValue: any): Promise<Object>
    
    // filterOptionsArray expects array of objs with keys: attribute, filter characteristic
    function getDataAttributes(fetchPayloadJson: Promise<apiResponse | undefined>, filterOptionsArray: Object[] | undefined): Promise<Object>
    }