if (typeof define !== 'function') { var define = require('amdefine')(module) }
define(['../markdown_helpers', './dialect_helpers', './gruber', '../parser'], function (MarkdownHelpers, DialectHelpers, Gruber, Markdown) {

  var comproDLS = DialectHelpers.subclassDialect( Gruber ),
      extract_attr = MarkdownHelpers.extract_attr,
      forEach = MarkdownHelpers.forEach;

  comproDLS.processMetaHash = function processMetaHash( metablock, tagtype ) {
    var meta, metaToken, attr = {};
    if(tagtype === "meta"){
      meta = metablock[1].trim();
      metaToken = meta.split(':');
      if(metaToken[0] === "tag-type" && metaToken[1].trim().toLowerCase() === "video")
        attr["class"] = "meta-video";
      attr["type"] = "meta";
    }

    return attr;
  };

  comproDLS.block.document_meta = function document_meta( block ) {

    var cap, list, attr;
    var rules = {
      /*******************************************
      * comprocomproDLS Changes
      * Adding new grammar rule for meta info
      *********************************************/
      meta:/\s*>\s-\s\[meta\](.+)/,
    };

    if((cap = block.match(rules.meta))){
      list = ["div"];
      attr = this.dialect.processMetaHash( cap, "meta" );
      list.push(attr);
      return [ list ];
    }
    else{
      return undefined;
    }

    return [];
  };

  Markdown.dialects.comproDLS = comproDLS;
  Markdown.dialects.comproDLS.inline.__escape__ = /^\\[\\`\*_{}\[\]()#\+.!\-|:]/;
  Markdown.buildBlockOrder ( Markdown.dialects.comproDLS.block );
  Markdown.buildInlinePatterns( Markdown.dialects.comproDLS.inline );

  return comproDLS;
});
