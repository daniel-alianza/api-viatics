declare module 'fast-xml-parser' {
  interface ParserOptions {
    ignoreAttributes?: boolean;
    attributeNamePrefix?: string;
    textNodeName?: string;
    ignoreNameSpace?: boolean;
    attrNodeName?: string;
    allowBooleanAttributes?: boolean;
    parseNodeValue?: boolean;
    parseAttributeValue?: boolean;
    trimValues?: boolean;
    cdataTagName?: string;
    cdataPositionChar?: string;
    localeRange?: string;
    parseTrueNumberOnly?: boolean;
    arrayMode?: boolean;
    stopNodes?: string[];
    emptyTag?: string;
  }

  interface XMLParser {
    parse(xml: string, options?: ParserOptions): any;
  }

  const parse: XMLParser['parse'];
  export { parse, ParserOptions };
}
