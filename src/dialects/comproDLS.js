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
    else if(tagtype === "media"){
      if(metablock[1].trim().toLowerCase() === "video-youtube"){
        attr["title"] = metablock[2];
        var href = metablock[3].toString();
        //Regex to validate youtube videos
        var patt = new RegExp(/https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig);
      
        attr["src"] = href.replace(patt, "http://www.youtube.com/embed/$1?autoplay=1");
        attr["frameborder"] = "0";
        attr["allowfullscreen"] = "true";
      }
    }
   
    return attr;
  };

  comproDLS.block.document_meta = function document_meta( block ) {
    var cap, list, attr, src;
    var rules = {
      /*******************************************
      * comprocomproDLS Changes
      * Adding new grammar rule for meta info
      *********************************************/
      meta:/\s*>\s-\s\[meta\](.+)/,
      /*******************************************
      * comprocomproDLS Changes
      * Adding new grammar rule "media": {Type}{Title}Href. Possible type values are:
      * 1. video-youtube
      *********************************************/
      media:/\s*{(.*?)}\s*{(.*?)}\s*(.*)/,
      code: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/
    };

    if((cap = block.match(rules.meta))){
      list = ["div"];
      attr = this.dialect.processMetaHash( cap, "meta" );
      list.push(attr);
      return [ list ];
    }
    else if((cap = block.match(rules.media))){
      list = ["iframe"];
      attr = this.dialect.processMetaHash( cap, "media" );
      list.push(attr);
      return [ list ];
    }
    else if((cap = block.match(rules.code))){
      list = ["code_block"];
      src = cap[3];
      list.push(src);
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
