/*
Copyright (c) 2003-2010, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

/**
 * @fileOverview The "sourcearea" plugin. It registers the "source" editing
 *		mode, which displays the raw data being edited in the editor.
 */

CKEDITOR.plugins.add( 'mediawiki',
{
	requires : [ 'fakeobjects', 'htmlwriter', 'dialog' ],

	init : function( editor )
	{
        // add the CSS for general styles of Mediawiki elements
        editor.addCss(
            'img.fck_mw_frame' +
            '{' +
                'background-color: #F9F9F9;' +
                'border: 1px solid #CCCCCC;' +
                'padding: 3px !important;' +
            '}\n' +
            'img.fck_mw_right' +
            '{' +
                'margin: 0.5em 5px 0.8em 1.4em;' +
                'clear: right;'+
                'float: right;'+
            '}\n' +
            'img.fck_mw_left' +
            '{' +
                'margin: 0.5em 1.4em 0.8em 0em;' +
            '}\n' +
            'img.fck_mw_center' +
            '{' +
                'margin-left: auto;' +
                'margin-right: auto;' +
                'margin-bottom: 0.5em;' +
                'display: block;' +
            '}\n' +
            'img.fck_mw_notfound' +
            '{' +
                'font-size: 1px;' +
                'height: 25px;' +
                'width: 25px;' +
                'overflow: hidden;' +
            '}\n' +
            'img.fck_mw_border' +
            '{' +
                'border: 1px solid #dddddd;' +
            '}\n'
        );
		// Add the CSS styles for special wiki placeholders.
		editor.addCss(
			'img.FCK__MWRef' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_ref.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 18px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'img.FCK__MWReferences' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_references.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'img.FCK__MWSignature' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_signature.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +

			'img.FCK__MWMagicWord' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_magic.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'img.FCK__MWSpecial' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_special.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'img.FCK__MWNowiki' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_nowiki.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'img.FCK__MWIncludeonly' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_includeonly.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'img.FCK__MWNoinclude' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_noinclude.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'img.FCK__MWGallery' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_gallery.gif' ) + ');' +
				'background-position: center center;' +
				'background-repeat: no-repeat;' +
				'border: 1px solid #a9a9a9;' +
				'width: 66px !important;' +
				'height: 15px !important;' +
			'}\n' +
			'span.fck_mw_property' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_property.gif' ) + ');' +
				'background-position: 0 center;' +
				'background-repeat: no-repeat;' +
                'background-color: #ffcd87;' +
				'border: 1px solid #a9a9a9;' +
				'padding-left: 18px;' +
			'}\n' +
			'span.fck_mw_category' +
			'{' +
				'background-image: url(' + CKEDITOR.getUrl( this.path + 'images/icon_category.gif' ) + ');' +
				'background-position: 0 center;' +
				'background-repeat: no-repeat;' +
                'background-color: #94b0f3;' +
				'border: 1px solid #a9a9a9;' +
				'padding-left: 18px;' +
			'}\n'
		);
		var wikiFilterRules =
			{
				elements :
				{
					span : function( element )
					{
                        var eClassName = element.attributes['class'] || '';
                        var className = null;
                        switch ( eClassName ){
                            case 'fck_mw_source' :
                                className = 'FCK__MWSource';
                            case 'fck_mw_ref' :
                                if (className == null)
                                    className = 'FCK__MWRef';
                            case 'fck_mw_references' :
                                if ( className == null )
                                    className = 'FCK__MWReferences';
                            case 'fck_mw_template' :
                                if ( className == null ) //YC
                                    className = 'FCK__MWTemplate'; //YC
                            case 'fck_mw_magic' :
                                if ( className == null )
                                    className = 'FCK__MWMagicWord';
                            case 'fck_mw_special' : //YC
                                if ( className == null )
                                    className = 'FCK__MWSpecial';
                            case 'fck_mw_nowiki' :
                                if ( className == null )
                                    className = 'FCK__MWNowiki';
                            case 'fck_mw_html' :
                                if ( className == null )
                                    className = 'FCK__MWHtml';
                            case 'fck_mw_includeonly' :
                                if ( className == null )
                                    className = 'FCK__MWIncludeonly';
                            case 'fck_mw_gallery' :
                                if ( className == null )
                                    className = 'FCK__MWGallery';
                            case 'fck_mw_noinclude' :
                                if ( className == null )
                                    className = 'FCK__MWNoinclude';
                            case 'fck_mw_onlyinclude' :
                                if ( className == null )
                                    className = 'FCK__MWOnlyinclude';
                            case 'fck_mw_signature' :
                                if ( className == null )
                                    className = 'FCK__MWSignature';
                            case 'fck_smw_query' :
                                if ( className == null )
                                    className = 'FCK__SMWquery';
                            case 'fck_smw_webservice' :
                                if ( className == null )
                                    className = 'FCK__SMWwebservice'
                            case 'fck_smw_rule' :
                                if ( className == null )
                                    className = 'FCK__SMWrule'
                                if ( className )
                                   return editor.createFakeParserElement( element, className, 'span' );
                            break;
                        }
					}
				}
			};

        var dataProcessor = editor.dataProcessor = new CKEDITOR.customprocessor( editor );
        dataProcessor.dataFilter.addRules( wikiFilterRules );

        var signatureCommand =
    	{
        	canUndo : false,    // The undo snapshot will be handled by 'insertElement'.
            exec : function( editor ) {
                var sig = '<span class="fck_mw_signature">_</span>',
                    element = CKEDITOR.dom.element.createFromHtml(sig, editor.document),
                    newFakeObj = editor.createFakeElement( element, 'FCK__MWSignature', 'span' );
                editor.insertElement( newFakeObj );
            }
        };

        // language logic for additional messages
        var MWpluginLang = []
        MWpluginLang['en'] = {
            invalidContent  : 'invalid content',
            searching       : 'searching...',
            externalLink    : 'external link... no search for it',
            startTyping     : 'start typing in the above field',
            stopTyping      : 'stop typing to search',
            tooManyResults  : 'too many results...',
            // image
            imgTitle        : 'Mediawiki Image',
            fileName        : 'Image file name',
            fileNameExtUrl  : 'Image file name or URL',
            searchLabel     : 'Automatic search results (%s)',
            noImgFound      : 'no images found',
            oneImgFound     : 'one image found',
            manyImgFound    : ' images found',
            caption         : 'Caption',
            imgType         : 'Special type',
            alignCenter     : 'Center',
            // signature
            signature       : 'Signature',
            // special tags
            specialTags     : 'Special Tags',
            specialTagTitle : 'Special Tags Dialogue',
            specialTagDef   : 'Define any special tag, magic word or parser function:',
            // link
            linkTitle       : 'Mediawiki Link',
            noPageFound     : 'no article found',
            onePageFound    : 'one article found',
            manyPageFound   : ' articles found',
            emailLink       : 'e-mail link... no search for it',
            anchorLink      : 'anchor link... no search for it',
            defineTarget    : 'Define the wiki page for the link target:',
            chooseTarget    : 'Choose an existing wikipage for the link target:'
        }

        MWpluginLang['de'] = {
            invalidContent  : 'invalid content',
            searching       : 'suche...',
            externalLink    : 'externer Link... es wird nicht danach gesucht',
            startTyping     : 'Eingabe im oberen Feld',
            stopTyping      : 'Tippen beenden um zu suchen',
            tooManyResults  : 'zu viele Ergebnisse...',
            // image
            imgTitle        : 'Mediawiki Bild',
            fileName        : 'Dateiname',
            fileNameExtUrl  : 'Dateiname oder URL',
            searchLabel     : 'automatische Suchergebnisse (%s)',
            noImgFound      : 'keine Bilder gefunden',
            oneImgFound     : '1 Bild gefunden',
            manyImgFound    : ' Bilder gefunden',
            caption         : 'Beschreibung',
            imgType         : 'Bildtyp',
            alignCenter     : 'Mitte',
            // signature
            signature       : 'Signatur',
            // special tags
            specialTags     : 'Spezial Tags',
            specialTagTitle : 'Spezial Tags Dialog',
            specialTagDef   : 'Definiere einen Spezialtag, ein magisches Wort oder eine Parserfunktion:',
            // link
            linkTitle       : 'Mediawiki Link',
            noPageFound     : 'keinen Artikel gefunden',
            onePageFound    : '1 Artikel gefunden',
            manyPageFound   : ' Artikel gefunden',
            emailLink       : 'e-mail link... es wird nicht danach gesucht',
            anchorLink      : 'anchor link... es wird nicht danach gesucht',
            defineTarget    : 'Definiere eine Wikiseite als Linkziel:',
            chooseTarget    : 'Wähle eine existierende Wikiseite als Linkziel:'
        }
        if (typeof MWpluginLang[editor.langCode] != 'undefined' )
            editor.lang.mwplugin = MWpluginLang[editor.langCode];
        else
            editor.lang.mwplugin = MWpluginLang['en'];

        // define commands and dialogues
        editor.addCommand( 'link', new CKEDITOR.dialogCommand( 'MWLink' ) );
        CKEDITOR.dialog.add( 'MWLink', this.path + 'dialogs/link.js' );
        editor.addCommand( 'image', new CKEDITOR.dialogCommand( 'MWImage' ) );
        CKEDITOR.dialog.add( 'MWImage', this.path + 'dialogs/image.js' );
        editor.addCommand( 'MWSpecialTags', new CKEDITOR.dialogCommand( 'MWSpecialTags' ) );
        CKEDITOR.dialog.add( 'MWSpecialTags', this.path + 'dialogs/special.js' );
        editor.addCommand( 'MWSignature', signatureCommand);
        if (editor.addMenuItem) {
            // A group menu is required
            // order, as second parameter, is not required
            editor.addMenuGroup('mediawiki');
                // Create a menu item
                editor.addMenuItem('MWSpecialTags', {
                    label: editor.lang.mwplugin.specialTags,
                    command: 'MWSpecialTags',
                    group: 'mediawiki'
                });
        }
		if ( editor.ui.addButton )
		{
			editor.ui.addButton( 'MWSpecialTags',
				{
					label : editor.lang.mwplugin.specialTags,
					command : 'MWSpecialTags',
                    icon: this.path + 'images/tb_icon_special.gif'
				});
			editor.ui.addButton( 'MWSignature',
				{
					label : editor.lang.mwplugin.signature,
					command : 'MWSignature',
                    icon: this.path + 'images/tb_icon_sig.gif'
				});

		}
       
        // context menu
        if (editor.contextMenu) {
            editor.contextMenu.addListener(function(element, selection) {
                var name = element.getName();
                // fake image for some <span> with special tag
                if ( name == 'img' &&
                     element.getAttribute( 'class' ) &&
                     element.getAttribute( 'class' ).InArray( [
                        'FCK__MWSpecial',
                        'FCK__MWMagicWord',
                        'FCK__MWNowiki',
                        'FCK__MWIncludeonly',
                        'FCK__MWNoinclude',
                        'FCK__MWOnlyinclude'
                     ])
                   ) return {MWSpecialTags: CKEDITOR.TRISTATE_ON};
            });
        }
		editor.on( 'doubleclick', function( evt )
			{
				var element = CKEDITOR.plugins.link.getSelectedLink( editor ) || evt.data.element;

				if ( element.is( 'a' ) || ( element.is( 'img' ) && element.getAttribute( '_cke_real_element_type' ) == 'anchor' ) )
					evt.data.dialog = 'MWLink';
                else if ( element.is( 'img' ) ) {
                    if ( !element.getAttribute( '_cke_real_element_type' ) )
                        evt.data.dialog = 'MWImage';
                    else if ( element.getAttribute( 'class' ) &&
                        element.getAttribute( 'class' ).InArray( [
                            'FCK__MWSpecial',
                            'FCK__MWMagicWord',
                            'FCK__MWNowiki',
                            'FCK__MWIncludeonly',
                            'FCK__MWNoinclude',
                            'FCK__MWOnlyinclude'
                        ])
                    )
                        evt.data.dialog = 'MWSpecialTags';		
                }
            }
        )
    }

});

CKEDITOR.customprocessor = function( editor )
{
   this.editor = editor;
   this.writer = new CKEDITOR.htmlWriter();
   this.dataFilter = new CKEDITOR.htmlParser.filter();
   this.htmlFilter = new CKEDITOR.htmlParser.filter();
};

CKEDITOR.customprocessor.prototype =
{
	_inPre : false,
	_inLSpace : false,

   toHtml : function( data, fixForBody )
   {
        // all converting to html (like: data = data.replace( /</g, '&lt;' );)
        var loadHTMLFromAjax = function( result ){
            if (window.parent.popup &&
                window.parent.popup.parent.wgCKeditorInstance &&
                window.parent.popup.parent.wgCKeditorCurrentMode != 'wysiwyg') {

                window.parent.popup.parent.wgCKeditorInstance.setData(result.responseText);
                window.parent.popup.parent.wgCKeditorCurrentMode = 'wysiwyg';
            }
            else if (window.parent.wgCKeditorInstance &&
                     window.parent.wgCKeditorCurrentMode != 'wysiwyg') {
                window.parent.wgCKeditorInstance.setData(result.responseText);
                window.parent.wgCKeditorCurrentMode = 'wysiwyg';
            }
        }
        // Hide the textarea to avoid seeing the code change.
        //textarea.hide();
        var loading = document.createElement( 'span' );
        loading.innerHTML = '&nbsp;'+ 'Loading Wikitext. Please wait...' + '&nbsp;';
        loading.style.position = 'absolute';
        loading.style.left = '5px';
        //textarea.parentNode.appendChild( loading, textarea );

        // prevent double transformation because of some weird runtime issues
        // with the event dataReady in the smwtoolbar plugin
        if (!(data.indexOf('<p>') == 0 &&
              data.match(/<.*?_fck_mw/) || data.match(/class="fck_mw_\w+"/i)) ) {

            // Use Ajax to transform the Wikitext to HTML.
            if( window.parent.popup ){
                window.parent.popup.parent.FCK_sajax( 'wfSajaxWikiToHTML', [data, window.parent.popup.wgPageName], loadHTMLFromAjax );
            } else {
                window.parent.FCK_sajax( 'wfSajaxWikiToHTML', [data, window.parent.wgPageName], loadHTMLFromAjax );
            }
        }
        var fragment = CKEDITOR.htmlParser.fragment.fromHtml( data, fixForBody ),
        writer = new CKEDITOR.htmlParser.basicWriter();

        fragment.writeHtml( writer, this.dataFilter );
	    data = writer.getHtml( true );
       
	    return data;
   },

	/*
	 * Converts a DOM (sub-)tree to a string in the data format.
	 *     @param {Object} rootNode The node that contains the DOM tree to be
	 *            converted to the data format.
	 *     @param {Boolean} excludeRoot Indicates that the root node must not
	 *            be included in the conversion, only its children.
	 *     @param {Boolean} format Indicates that the data must be formatted
	 *            for human reading. Not all Data Processors may provide it.
	 */
	toDataFormat : function( data, fixForBody ){
        if ( (window.parent.showFCKEditor &&
             !(window.parent.showFCKEditor & window.parent.RTE_VISIBLE)) )
             return window.parent.document.getElementById(window.parent.wgCKeditorInstance.name).value;

        if (window.parent.wgCKeditorCurrentMode)
            window.parent.wgCKeditorCurrentMode = 'source';
        else if (window.parent.popup && window.parent.popup.parent.wgCKeditorCurrentMode)
            window.parent.popup.parent.wgCKeditorCurrentMode = 'source';
        
		if (CKEDITOR.env.ie) {
			data = this.ieFixHTML(data);
		}

        data = '<body xmlns:x="http://excel">' + data.htmlEntities()+ '</body>';
        // fix <img> tags
        data = data.replace(/(<img[^>]*)([^/])>/gi, '$1$2/>' );
        // fix <hr> and <br> tags
        data = data.replace(/<(hr|br)>/gi, '<$1/>' );
        // and the same with attributes
        data = data.replace(/<(hr|br)([^>]*)([^/])>/gi, '<$1$2$3/>' );
        // remove some unncessary br tags that are followed by a </p> or </li>
        data = data.replace(/<br\/>(\s*<\/(p|li)>)/gi, '$1');
        // also remove <br/> before nested lists
        data = data.replace(/<br\/>(\s*<(ol|ul)>)/gi, '$1');
		// in IE the values of the class and alt attribute are not quoted
        data = data.replace(/class=([^\"].*?)\s/gi, 'class="$1" ');
        data = data.replace(/alt=([^\"].*?)\s/gi, 'alt="$1" ');
        // when inserting data with Excel an unmatched <col> element exists, thus remove it
        data = data.replace(/<col[^>]*>/gi, '' );
		

        var rootNode = this._getNodeFromHtml( data );
		// rootNode is <body>.
		// Normalize the document for text node processing (except IE - #1586).

		if ( !CKEDITOR.env.ie ) {
			rootNode.normalize();
        }

		var stringBuilder = new Array();
		this._AppendNode( rootNode, stringBuilder, '' );
		return stringBuilder.join( '' ).Trim();
	},

    _getNodeFromHtml : function( data ) {
        if (window.DOMParser) {
            parser=new DOMParser();
            var xmlDoc=parser.parseFromString(data,"text/xml");
        }
        else // Internet Explorer
        {
            data = this.ieFixHTML(data);
            var xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async="false";
            xmlDoc.loadXML(data);
        }

        var rootNode = xmlDoc.documentElement;
        return rootNode;
    },

	// Collection of element definitions:
	//		0 : Prefix
	//		1 : Suffix
	//		2 : Ignore children
	_BasicElements : {
		body	: [ ],
		b		: [ "'''", "'''" ],
		strong	: [ "'''", "'''" ],
		i		: [ "''", "''" ],
		em		: [ "''", "''" ],
		p		: [ '\n', '\n' ],
		h1		: [ '\n= ', ' =\n' ],
		h2		: [ '\n== ', ' ==\n' ],
		h3		: [ '\n=== ', ' ===\n' ],
		h4		: [ '\n==== ', ' ====\n' ],
		h5		: [ '\n===== ', ' =====\n' ],
		h6		: [ '\n====== ', ' ======\n' ],
		br		: [ '<br/>', null, true ],
		hr		: [ '\n----\n', null, true ]
	} ,

	// This function is based on FCKXHtml._AppendNode.
	_AppendNode : function( htmlNode, stringBuilder, prefix ){
		if ( !htmlNode )
			return;

		switch ( htmlNode.nodeType ){
			// Element Node.
			case 1 :

				// Mozilla insert custom nodes in the DOM.
				if ( CKEDITOR.env.gecko && htmlNode.hasAttribute( '_moz_editor_bogus_node' ) )
					return;
                // Avoid any firebug nodes in the code, This also applies to Mozilla only
				if ( CKEDITOR.env.gecko && htmlNode.hasAttribute( 'firebugversion' ) )
					return;

                // get real element from fake element
//			    if ( htmlNode.getAttribute( 'data-cke-realelement' ) ) {
	            if ( htmlNode.getAttribute( 'data-cke-realelement' ) ) {
                    this._AppendNode( this._getRealElement( htmlNode ), stringBuilder, prefix );
                    return;
                }

				// Get the element name.
				var sNodeName = htmlNode.tagName.toLowerCase();

				if ( CKEDITOR.env.ie ){
					// IE doens't include the scope name in the nodeName. So, add the namespace.
					if ( htmlNode.scopeName && htmlNode.scopeName != 'HTML' && htmlNode.scopeName != 'FCK' )
						sNodeName = htmlNode.scopeName.toLowerCase() + ':' + sNodeName;
				} else {
					if ( sNodeName.StartsWith( 'fck:' ) )
						sNodeName = sNodeName.Remove( 0, 4 );
				}

				// Check if the node name is valid, otherwise ignore this tag.
				// If the nodeName starts with a slash, it is a orphan closing tag.
				// On some strange cases, the nodeName is empty, even if the node exists.
				if ( sNodeName == "" || sNodeName.substring(0, 1) == '/' || sNodeName == "style")
					return;

				if ( sNodeName == 'br' && ( this._inPre || this._inLSpace ) ){
					stringBuilder.push( "\n" );
					if ( this._inLSpace )
						stringBuilder.push( " " );
					return;
				}

				// Remove the <br> if it is a bogus node.
//				if ( CKEDITOR.env.gecko && sNodeName == 'br' && htmlNode.getAttribute( 'type', 2 ) == '_moz' )
//					return;
				if ( CKEDITOR.env.gecko && sNodeName == 'br' && htmlNode.getAttribute( 'type' ) == '_moz' )
					return;

                // Translate the <br fckLR="true"> into \n
				if ( sNodeName == 'br' && htmlNode.getAttribute( 'fcklr' ) == 'true' ) {
                    stringBuilder.push("\n");
					return;
                }

				// The already processed nodes must be marked to avoid then to be duplicated (bad formatted HTML).
				// So here, the "mark" is checked... if the element is Ok, then mark it.
                /*
				if ( htmlNode._fckxhtmljob && htmlNode._fckxhtmljob == FCKXHtml.CurrentJobNum )
					return;
                */
				var basicElement = this._BasicElements[ sNodeName ];
				if ( basicElement ){
					var basic0 = basicElement[0];
					var basic1 = basicElement[1];

                    // work around for text alignment, fix bug 12043
                    if (sNodeName == 'p') {
                        try {
                            var style = htmlNode.getAttribute('style') || '',
                                alignment = style.match(/text-align:\s*(\w+);?/i);
                            if ( alignment[1].toLowerCase().IEquals("right", "center", "justify" ) ) {
                                this._AppendTextNode( htmlNode, stringBuilder, sNodeName, prefix);
                                return;
                            }
                        } catch (e) {};
                    }

					if ( ( basicElement[0] == "''" || basicElement[0] == "'''" ) && stringBuilder.length > 2 ){
						var pr1 = stringBuilder[stringBuilder.length-1];
						var pr2 = stringBuilder[stringBuilder.length-2];

						if ( pr1 + pr2 == "'''''") {
							if ( basicElement[0] == "''" ){
								basic0 = '<i>';
								basic1 = '</i>';
							}
							if ( basicElement[0] == "'''" ){
								basic0 = '<b>';
								basic1 = '</b>';
							}
						}
					}

					if ( basic0 )
						stringBuilder.push( basic0 );

					var len = stringBuilder.length;

					if ( !basicElement[2] ){
						this._AppendChildNodes( htmlNode, stringBuilder, prefix );
						// only empty element inside, remove it to avoid quotes
						if ( ( stringBuilder.length == len || ( stringBuilder.length == len + 1 && !stringBuilder[len].length ) )
							&& basicElement[0] && basicElement[0].charAt(0) == "'" ){
							stringBuilder.pop();
							stringBuilder.pop();
							return;
						}
					}

					if ( basic1 )
						stringBuilder.push( basic1 );
				} else {
					switch ( sNodeName ){
						case 'ol' :
						case 'ul' :
							var isFirstLevel = !htmlNode.parentNode.nodeName.IEquals( 'ul', 'ol', 'li', 'dl', 'dt', 'dd' ),
                                listStyle = htmlNode.getAttribute('style') || '',
                                startNum = htmlNode.getAttribute('start') || '';
                            this.preserveLiNode = (listStyle && !listStyle.match(/list-style-type:\s*decimal;/i) || startNum && startNum != '1');
                            if (this.preserveLiNode) {
                                stringBuilder.push('<' + sNodeName);
                                if (startNum)
                                    stringBuilder.push(' start="' + startNum + '"');
                                if (listStyle)
                                    stringBuilder.push(' style="' + listStyle + '"');
                                stringBuilder.push('>\n');
                            }

							this._AppendChildNodes( htmlNode, stringBuilder, prefix );

                            if (this.preserveLiNode)
                                stringBuilder.push('</' + sNodeName + '>');

							if ( isFirstLevel && stringBuilder[ stringBuilder.length - 1 ] != "\n" ) {
								stringBuilder.push( '\n' );
							}

							break;

						case 'li' :

                            if (this.preserveLiNode) {
                                stringBuilder.push('<li>');
                                this._AppendChildNodes( htmlNode, stringBuilder, prefix );
                                stringBuilder.push('</li>\n');
                                break;
                            }

							if( stringBuilder.length > 1 ){
								var sLastStr = stringBuilder[ stringBuilder.length - 1 ];
								if ( sLastStr != ";" && sLastStr != ":" && sLastStr != "#" && sLastStr != "*" )
 									stringBuilder.push( '\n' + prefix );
							}

							var parent = htmlNode.parentNode;
							var listType = "*";

							while ( parent ){
								if ( parent.nodeName.toLowerCase() == 'ul' ){
									listType = "*";
									break;
								} else if ( parent.nodeName.toLowerCase() == 'ol' ){
									listType = "#";
									break;
								}
								else if ( parent.nodeName.toLowerCase() != 'li' )
									break;

								parent = parent.parentNode;
							}

							stringBuilder.push( listType );
							this._AppendChildNodes( htmlNode, stringBuilder, prefix + listType );

							break;

						case 'a' :
                            // if there is no inner HTML in the Link, do not add it to the wikitext
                            if (! this._GetNodeText(htmlNode).Trim() ) break;
                            
							var pipeline = true;
							// Get the actual Link href.
							var href = htmlNode.getAttribute( '_cke_saved_href' );
							var hrefType = htmlNode.getAttribute( '_cke_mw_type' ) || '';

                            // this is still the old style, thats used in the parser (should be fixed soon)
                            if ( href == null ) {
                                href = htmlNode.getAttribute( '_fcksavedurl' );
                                hrefType = htmlNode.getAttribute( '_fck_mw_type' ) || '';
                            }

							if ( href == null ) {
								href = htmlNode.getAttribute( 'href' ) || '';
							}
							
							//fix: Issue 14792 - Link with anchor is changed
							//hrefType is a substring of href from the beginning until the colon. 
							//it consists only of alphanumeric chars and optional url encoded chars in the middle.
							var hrefTypeRegexp = /^(\w+(?:%\d{0,3})*\w*):/i;
							var matches = href.match(hrefTypeRegexp);
							if(hrefType == '' && matches) {
								hrefType = matches[1]; 
							}
							
//						  if ( hrefType == '' && href.indexOf(':') > -1) {
//                            hrefType = href.substring(0, href.indexOf(':')).toLowerCase();
//						  }

							var isWikiUrl = true;

							if ( hrefType != "" && 
                                 hrefType != "http" &&
                                 hrefType != "https" &&
                                 hrefType != "mailto" &&
                                 !href.StartsWith(hrefType.FirstToUpper() + ':') )
								stringBuilder.push( '[[' + hrefType.FirstToUpper() + ':' );
							else if ( htmlNode.className == "extiw" ){
								stringBuilder.push( '[[' );
								isWikiUrl = true;
							} else {
								isWikiUrl = !( href.StartsWith( 'mailto:' ) || /^\w+:\/\//.test( href ) || /\{\{[^\}]*\}\}/.test( href ) );
								stringBuilder.push( isWikiUrl ? '[[' : '[' );
							}
							// #2223
							if( htmlNode.getAttribute( '_fcknotitle' ) && htmlNode.getAttribute( '_fcknotitle' ) == "true" ){
								var testHref = decodeURIComponent(htmlNode.getAttribute('href'));
								var testInner = this._GetNodeText(htmlNode) || '';
								if ( href.toLowerCase().StartsWith( 'category:' ) )
									testInner = 'Category:' + testInner;
								if ( testHref.toLowerCase().StartsWith( 'rtecolon' ) )
									testHref = testHref.replace( /rtecolon/, ":" );
								testInner = testInner.replace( /&amp;/, "&" );
								if ( testInner == testHref )
									pipeline = false;
							}
							if( href.toLowerCase().StartsWith( 'rtecolon' ) ){ // change 'rtecolon=' => ':' in links
								stringBuilder.push(':');
								href = href.substring(8);
							}
                            if ( isWikiUrl ) href = decodeURIComponent(href);
							stringBuilder.push( href );
                            var innerHTML = this._GetNodeText(htmlNode) 
							if ( pipeline && innerHTML != '[n]' && ( !isWikiUrl || href != innerHTML || !href.toLowerCase().StartsWith( "category:" ) ) ){
								stringBuilder.push( isWikiUrl? '|' : ' ' );
								this._AppendChildNodes( htmlNode, stringBuilder, prefix );
							}
							stringBuilder.push( isWikiUrl ? ']]' : ']' );

							break;

						case 'dl' :

							this._AppendChildNodes( htmlNode, stringBuilder, prefix );
							var isFirstLevel = !htmlNode.parentNode.nodeName.IEquals( 'ul', 'ol', 'li', 'dl', 'dd', 'dt' );
							if ( isFirstLevel && stringBuilder[ stringBuilder.length - 1 ] != "\n" )
								stringBuilder.push( '\n' );

							break;

						case 'dt' :

							if( stringBuilder.length > 1 ){
								var sLastStr = stringBuilder[ stringBuilder.length - 1 ];
								if ( sLastStr != ";" && sLastStr != ":" && sLastStr != "#" && sLastStr != "*" )
 									stringBuilder.push( '\n' + prefix );
							}
							stringBuilder.push( ';' );
							this._AppendChildNodes( htmlNode, stringBuilder, prefix + ";" );

							break;

						case 'dd' :

							if( stringBuilder.length > 1 ){
								var sLastStr = stringBuilder[ stringBuilder.length - 1 ];
								if ( sLastStr != ";" && sLastStr != ":" && sLastStr != "#" && sLastStr != "*" )
 									stringBuilder.push( '\n' + prefix );
							}
							stringBuilder.push( ':' );
							this._AppendChildNodes( htmlNode, stringBuilder, prefix + ":" );

							break;

						case 'table' :

							var attribs = this._GetAttributesStr( htmlNode );

							stringBuilder.push( '\n{|' );
							if ( attribs.length > 0 )
								stringBuilder.push( attribs );
							stringBuilder.push( '\n' );

							if ( htmlNode.caption && this._GetNodeText(htmlNode.caption).length > 0 ){
								stringBuilder.push( '|+ ' );
								this._AppendChildNodes( htmlNode.caption, stringBuilder, prefix );
								stringBuilder.push( '\n' );
							}

                            // iterate over children, normally <tr>
                            var currentNode = (htmlNode.childNodes.length > 0) ? htmlNode.childNodes[0] : null;
                            var level = 0;

							while (currentNode) {
                                // reset the tagname. Needed later when finding next nodes
                                var currentTagName = null;

                                // we found an element node
                                if (currentNode.nodeType == 1) {
                                    // remember the tag name
                                    currentTagName = currentNode.tagName.toLowerCase();
                                    // we have a table row tag
                                    if (currentTagName == "tr") {
                                        attribs = this._GetAttributesStr( currentNode ) ;

                                        stringBuilder.push( '|-' ) ;
                                        if ( attribs.length > 0 )
                                            stringBuilder.push( attribs ) ;
                                        stringBuilder.push( '\n' ) ;

//                                        var cell = currentNode.firstElementChild;
                                        var cell = currentNode.firstChild;
                                        while ( cell ) {
                                            attribs = this._GetAttributesStr( cell ) ;

                                            if ( cell.tagName.toLowerCase() == "th" )
                                                stringBuilder.push( '!' ) ;
                                            else
                                                stringBuilder.push( '|' ) ;

                                            if ( attribs.length > 0 )
                                                stringBuilder.push( attribs + ' |' ) ;

                                            stringBuilder.push( ' ' ) ;

                                            this._IsInsideCell = true ;
                                            this._AppendChildNodes( cell, stringBuilder, prefix ) ;
                                            this._IsInsideCell = false ;

                                            stringBuilder.push( '\n' ) ;
//                                            cell = cell.nextElementSibling;
                                            cell = cell.nextSibling;
                                        }
                                    }
                                    // not a <tr> found, then we only accept templates and special functions
                                    // which then probably build the table row in the wiki text
                                    else if (currentTagName == "img") {
                                        //alert('class: ' + currentNode.className);
                                        switch (currentNode.className) {
                                            case "FCK__MWSpecial" :
                                            case "FCK__MWTemplate" :
                                            case "FCK__SMWquery" :

                                                stringBuilder.push( '|-\n' ) ;
                                                this._IsInsideCell = true ;
                                                this._AppendNode( currentNode, stringBuilder, prefix ) ;
                                                this._IsInsideCell = false ;
                                                stringBuilder.push( '\n' ) ;
                                        }
                                    }
                                }
                                // find children if we are not inside table row.
                                // because the content of rows is handled directly above
                                if (currentNode.childNodes.length > 0 &&
                                    currentTagName != "tr") {
                                    level++;
                                    currentNode = currentNode.childNodes[0];
                                } else {
                                    var nextNode = currentNode.nextSibling;
                                    if (nextNode == null && level > 0) {
                                        while (level > 0) {
                                            currentNode = currentNode.parentNode;
                                            level--;
                                            nextNode = currentNode.nextSibling;
                                            if (nextNode) break;
                                        }
                                    }
                                    currentNode = nextNode;
                                }
                            }

							stringBuilder.push( '|}\n' ) ;

							break;

						case 'img' :

							var formula = htmlNode.getAttribute( '_cke_mw_math' );

							if ( formula && formula.length > 0 ){
								stringBuilder.push( '<math>' );
								stringBuilder.push( formula );
								stringBuilder.push( '</math>' );
								return;
							}
                            // external image?
                            var src = htmlNode.getAttribute( 'src' );
                            if (src.toLowerCase().match(/^https?:\/\//)) {
                                stringBuilder.push( src );
                                return;
                            }
                            
							var imgName		= htmlNode.getAttribute( '_fck_mw_filename' ) || htmlNode.getAttribute( '_cke_mw_filename' ) || '';
							var imgCaption	= htmlNode.getAttribute( 'alt' ) || '';
							var imgType		= htmlNode.getAttribute( '_fck_mw_type' ) || htmlNode.getAttribute( '_cke_mw_type' ) || '';
							var imgLocation	= htmlNode.getAttribute( '_fck_mw_location' ) || '';
							var imgWidth	= htmlNode.getAttribute( '_fck_mw_width' ) || '';
							var imgHeight	= htmlNode.getAttribute( '_fck_mw_height' ) || '';
                            var imgStyle    = htmlNode.getAttribute( 'style' ) || '';
                            var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec( imgStyle ),
                                imgStyleWidth = match && match[1] || 0;
                            match = /(?:^|\s)height\s*:\s*(\d+)/i.exec( imgStyle );
                            var imgStyleHeight = match && match[1] || 0;
							var imgRealWidth	= ( htmlNode.getAttribute( 'width' ) || '' ) + '';
							var imgRealHeight	= ( htmlNode.getAttribute( 'height' ) || '' ) + '';
                            var imgNolink = ( htmlNode.getAttribute( 'no-link' ) || '' ) + '';
                            var imgLink = ( htmlNode.getAttribute( 'link' ) || '' ) + '';

							stringBuilder.push( '[[File:' );
							stringBuilder.push( imgName );

							if ( imgStyleWidth.length > 0 )
								imgWidth = imgStyleWidth;
							else if ( imgWidth.length > 0 && imgRealWidth.length > 0 )
								imgWidth = imgRealWidth;

							if ( imgStyleHeight.length > 0 )
								imgHeight = imgStyleHeight;
							else if ( imgHeight.length > 0 && imgRealHeight.length > 0 )
								imgHeight = imgRealHeight;

							if ( imgType.length > 0 )
								stringBuilder.push( '|' + imgType );

							if ( imgLocation.length > 0 )
								stringBuilder.push( '|' + imgLocation );

							if ( imgWidth.length > 0 ){
								stringBuilder.push( '|' + imgWidth );

								if ( imgHeight.length > 0 )
									stringBuilder.push( 'x' + imgHeight );

								stringBuilder.push( 'px' );
							}

							if ( imgCaption.length > 0 )
								stringBuilder.push( '|' + imgCaption );
                            if ( imgNolink )
                                stringBuilder.push( '|link=' );
                            else if ( imgLink )
                                stringBuilder.push( '|link=' + imgLink );

							stringBuilder.push( ']]' );

							break;

						case 'span' :
                            var eClassName = htmlNode.getAttribute('class');
							switch ( eClassName ){
								case 'fck_mw_source' :
									var refLang = htmlNode.getAttribute( 'lang' );

									stringBuilder.push( '<source' );
									stringBuilder.push( ' lang="' + refLang + '"' );
									stringBuilder.push( '>' );
									stringBuilder.push( this._GetNodeText(htmlNode).htmlDecode().replace(/fckLR/g,'\r\n') );
									stringBuilder.push( '</source>' );
									return;

								case 'fck_mw_ref' :
									var refName = htmlNode.getAttribute( 'name' );

									stringBuilder.push( '<ref' );

									if ( refName && refName.length > 0 )
										stringBuilder.push( ' name="' + refName + '"' );

									if ( this._GetNodeText(htmlNode).length == 0 )
										stringBuilder.push( ' />' );
									else {
										stringBuilder.push( '>' );
										stringBuilder.push( this._GetNodeText(htmlNode) );
										stringBuilder.push( '</ref>' );
									}
									return;

								case 'fck_mw_references' :
									stringBuilder.push( '<references />' );
									return;

								case 'fck_mw_signature' :
									stringBuilder.push( this.editor.config.WikiSignature );
									return;

								case 'fck_mw_template' :
                                case 'fck_smw_query' :
                                    var inner= this._GetNodeText(htmlNode).htmlDecode().replace(/fckLR/g,'\r\n');
                                    if (inner == '{{!}}')
                                        stringBuilder.push( '\n' );
                                    stringBuilder.push( inner );
									return;
                                case 'fck_smw_webservice' :
                                case 'fck_smw_rule' :
									stringBuilder.push( this._GetNodeText(htmlNode).htmlDecode().replace(/fckLR/g,'\r\n') );
									return;
								case 'fck_mw_magic' :
                                    var magicWord = htmlNode.getAttribute( '_fck_mw_tagname' ) || '';
                                    if ( magicWord ) stringBuilder.push( '__' + magicWord + '__\n' );
									return;

                                case 'fck_mw_special' :
                                    var tagType = htmlNode.getAttribute( '_fck_mw_tagtype' ) || '';
                                    var tagName = htmlNode.getAttribute( '_fck_mw_tagname' ) || '';
								    switch (tagType) {
								        case 't' :
                                            var attribs = this._GetAttributesStr( htmlNode ) ;
                							stringBuilder.push( '<' + tagName ) ;

                                            if ( attribs.length > 0 )
                                                stringBuilder.push( attribs ) ;

                							stringBuilder.push( '>' ) ;
                                			stringBuilder.push( this._GetNodeText(htmlNode).htmlDecode().replace(/fckLR/g,'\r\n').replace(/_$/, '') );
                                            stringBuilder.push( '<\/' + tagName + '>' ) ;

								            break;
								        case 'c' :
								            stringBuilder.push( '__' + tagName + '__\n' );
								            break;
								        case 'v' :
								        case 'w' :
								            stringBuilder.push( '{{' + tagName + '}}' );
								            break;
								        case 'p' :
								            stringBuilder.push( '{{' + tagName );
								            if (this._GetNodeText(htmlNode).length > 0)
								                stringBuilder.push( ':' + this._GetNodeText(htmlNode).htmlDecode().replace(/fckLR/g,'\r\n').replace(/_$/, '') );
								            stringBuilder.push( '}}');
								            break;
                                        case 'sf' :
                                            stringBuilder.push( this._GetNodeText(htmlNode).htmlDecode().replace(/fckLR/g,'\r\n') );
                                            break;
								    }
								    return;


								case 'fck_mw_nowiki' :
									sNodeName = 'nowiki';
									break;

								case 'fck_mw_html' :
									sNodeName = 'html';
									break;

								case 'fck_mw_includeonly' :
									sNodeName = 'includeonly';
									break;

								case 'fck_mw_noinclude' :
									sNodeName = 'noinclude';
									break;

								case 'fck_mw_gallery' :
									sNodeName = 'gallery';
									break;

								case 'fck_mw_onlyinclude' :
									sNodeName = 'onlyinclude';
									break;
								case 'fck_mw_property' :
								case 'fck_mw_category' :
									stringBuilder.push( this._formatSemanticValues( htmlNode ) ) ;
									return ;
							}

							// Change the node name and fell in the "default" case.
							if ( htmlNode.getAttribute( '_fck_mw_customtag' ) )
								sNodeName = htmlNode.getAttribute( '_fck_mw_tagname' );
                            this._AppendTextNode( htmlNode, stringBuilder, sNodeName, prefix )
							break;
						case 'pre' :
							var attribs = this._GetAttributesStr( htmlNode );
                            var eClassName = htmlNode.getAttribute('class')
							if ( eClassName == "_fck_mw_lspace" ){
								stringBuilder.push( "\n " );
								this._inLSpace = true;
								this._AppendChildNodes( htmlNode, stringBuilder, prefix );
								this._inLSpace = false;
								var len = stringBuilder.length;
								if ( len > 1 ) {
									var tail = stringBuilder[len-2] + stringBuilder[len-1];
									if ( len > 2 ) {
										tail = stringBuilder[len-3] + tail;
									}
									if (tail.EndsWith("\n ")) {
										stringBuilder[len-1] = stringBuilder[len-1].replace(/ $/, "");
									} else if ( !tail.EndsWith("\n") ) {
										stringBuilder.push( "\n" );
									}
								}
							} else {
								stringBuilder.push( '<' );
								stringBuilder.push( sNodeName );

								if ( attribs.length > 0 )
									stringBuilder.push( attribs );
								if( this._GetNodeText(htmlNode) == '' )
									stringBuilder.push( ' />' );
								else {
									stringBuilder.push( '>' );
									this._inPre = true;
									this._AppendChildNodes( htmlNode, stringBuilder, prefix );
									this._inPre = false;

									stringBuilder.push( '<\/' );
									stringBuilder.push( sNodeName );
									stringBuilder.push( '>' );
								}
							}

							break;
						default :
                            this._AppendTextNode( htmlNode, stringBuilder, sNodeName, prefix )
							break;
					}
				}

				//htmlNode._fckxhtmljob = FCKXHtml.CurrentJobNum;
				return;

			// Text Node.
			case 3 :

				var parentIsSpecialTag = htmlNode.parentNode.getAttribute( '_fck_mw_customtag' );
				var textValue = htmlNode.nodeValue;
				if ( !parentIsSpecialTag ){
					if ( CKEDITOR.env.ie && this._inLSpace ) {
						textValue = textValue.replace( /\r/g, "\r " );
						if (textValue.EndsWith( "\r " )) {
							textValue = textValue.replace( /\r $/, "\r" );
						}
					}
					if ( !CKEDITOR.env.ie && this._inLSpace ) {
						textValue = textValue.replace( /\n(?! )/g, "\n " );
					}

					if (!this._inLSpace && !this._inPre) {
						textValue = textValue.replace( /[\n\t]/g, ' ' );
					}

                    // remove the next line to prevent that XML gets encoded
					//textValue = CKEDITOR.tools.htmlEncode( textValue );
					textValue = textValue.replace( /\u00A0/g, '&nbsp;' );

					if ( ( !htmlNode.previousSibling ||
					( stringBuilder.length > 0 && stringBuilder[ stringBuilder.length - 1 ].EndsWith( '\n' ) ) ) && !this._inLSpace && !this._inPre ){
						textValue = textValue.replace(/^\s*/, ''); // Ltrim
					}

					if ( !htmlNode.nextSibling && !this._inLSpace && !this._inPre && ( !htmlNode.parentNode || !htmlNode.parentNode.nextSibling ) )
						textValue = textValue.replace(/\s*$/, ''); // rtrim

					if( !this._inLSpace && !this._inPre && htmlNode.parentNode.tagName.toLowerCase() != 'a' ) {
						textValue = textValue.replace( / {2,}/g, ' ' );
                        textValue = this._EscapeWikiMarkup(textValue);
                    }

					if ( this._inLSpace && textValue.length == 1 && textValue.charCodeAt(0) == 13 )
						textValue = textValue + " ";

					if ( !this._inLSpace && !this._inPre && textValue == " " ) {
						var len = stringBuilder.length;
						if( len > 1 ) {
							var tail = stringBuilder[len-2] + stringBuilder[len-1];
							if ( tail.toString().EndsWith( "\n" ) )
								textValue = '';
						}
					}

					if ( this._IsInsideCell ) {
						var result, linkPattern = new RegExp( "\\[\\[.*?\\]\\]", "g" );
						while( result = linkPattern.exec( textValue ) ) {
							textValue = textValue.replace( result, result.toString().replace( /\|/g, "<!--LINK_PIPE-->" ) );
						}
						textValue = textValue.replace( /\|/g, '&#124;' );
						textValue = textValue.replace( /<!--LINK_PIPE-->/g, '|' );
					}
				} else {
					textValue = textValue.htmlDecode().replace(/fckLR/g,'\r\n');
				}

				stringBuilder.push( textValue );
				return;

			// Comment
			case 8 :
				// IE catches the <!DOTYPE ... > as a comment, but it has no
				// innerHTML, so we can catch it, and ignore it.
				if ( CKEDITOR.env.ie && !this._GetNodeText(htmlNode) )
					return;

				stringBuilder.push( "<!--"  );

				try	{
					stringBuilder.push( htmlNode.nodeValue );
				} catch( e ) { /* Do nothing... probably this is a wrong format comment. */ }

				stringBuilder.push( "-->" );
				return;
		}
	},

	_AppendChildNodes : function( htmlNode, stringBuilder, listPrefix ){
		var child = htmlNode.firstChild;

		while ( child ){
			this._AppendNode( child, stringBuilder, listPrefix );
			child = child.nextSibling;
		}
	},

    _AppendTextNode : function( htmlNode, stringBuilder, sNodeName, prefix ) {
    	var attribs = this._GetAttributesStr( htmlNode ) ;

		stringBuilder.push( '<' ) ;
		stringBuilder.push( sNodeName ) ;

    	if ( attribs.length > 0 )
			stringBuilder.push( attribs ) ;

		stringBuilder.push( '>' ) ;
		this._AppendChildNodes( htmlNode, stringBuilder, prefix ) ;
		stringBuilder.push( '<\/' ) ;
		stringBuilder.push( sNodeName ) ;
		stringBuilder.push( '>' ) ;
    },

	_GetAttributesStr : function( htmlNode ){
		var attStr = '';
		var aAttributes = htmlNode.attributes;

		for ( var n = 0; n < aAttributes.length; n++ ){
			var oAttribute = aAttributes[n];

			if ( oAttribute.specified ){
				var sAttName = oAttribute.nodeName.toLowerCase();
				var sAttValue;

				// Ignore any attribute starting with "_fck" or "_cke".
				if ( sAttName.StartsWith( '_fck' ) || sAttName.StartsWith( '_cke' ) )
					continue;
				// There is a bug in Mozilla that returns '_moz_xxx' attributes as specified.
				else if ( sAttName.indexOf( '_moz' ) == 0 )
					continue;
				// For "class", nodeValue must be used.
				else if ( sAttName == 'class' ){
					// Get the class, removing any fckXXX and ckeXXX we can have there.
					sAttValue = oAttribute.nodeValue.replace( /(^|\s*)(fck|cke)\S+/, '' ).Trim();

					if ( sAttValue.length == 0 )
						continue;
//				} else if ( sAttName == 'style' && CKEDITOR.env.ie ) {
				} else if (CKEDITOR.env.ie ) {
//					sAttValue = htmlNode.style.cssText.toLowerCase();
					sAttValue = oAttribute.nodeValue.toLowerCase();
				} else if ( sAttName == 'style' && CKEDITOR.env.gecko ) {
                    // the Mozilla leave style attributes such as -moz in the text, remove them
                    var styleVals = oAttribute.nodeValue.split(/;/),
                        styleAtts = [];
                    for (var i = 0; i < styleVals.length; i++) {
                        var styleVal = styleVals[i].Trim();
                        if ( ( !styleVal ) || (styleVal.indexOf('-moz') == 0) ) continue;

                        styleAtts.push( styleVals[i] );
                    }
                    sAttValue = styleAtts.join('; ');
				}
				// XHTML doens't support attribute minimization like "CHECKED". It must be trasformed to cheched="checked".
				else if ( oAttribute.nodeValue === true )
					sAttValue = sAttName;
				else {
//					sAttValue = htmlNode.getAttribute( sAttName, 2 );	// We must use getAttribute to get it exactly as it is defined.
					sAttValue = htmlNode.getAttribute( sAttName );	// We must use getAttribute to get it exactly as it is defined.
				}

				// leave templates
				if ( sAttName.StartsWith( '{{' ) && sAttName.EndsWith( '}}' ) ) {
					attStr += ' ' + sAttName;
				} else {
					attStr += ' ' + sAttName + '="' + String(sAttValue).replace( '"', '&quot;' ) + '"';
				}
			}
		}
		return attStr;
	},
    // in FF htmlNode.textContent is set, while IE needs htmlNode.text;
    _GetNodeText : function( htmlNode ) {
        var text = '';
        if (CKEDITOR.env.ie)
            text = htmlNode.text;
        else
            text = htmlNode.textContent;
        return (typeof text == 'undefined') ? '' : text;
    },

	// Property and Category values must be of a certain format. Otherwise this will break
	// the semantic annotation when switching between wikitext and WYSIWYG view
	_formatSemanticValues : function (htmlNode) {
		var text = this._GetNodeText(htmlNode);

		// remove any &nbsp;
		text = text.replace('&nbsp;', ' ');
		// remove any possible linebreaks
		text = text.replace('<br>', ' ');
        // and trim leading and trailing whitespaces
		text = text.Trim();
		// no value set, then add an space to fix problems with [[prop:val| ]]
		if (text.length == 0)
			text = " ";
		// regex to check for empty value
		var emptyVal = /^\s+$/;
        var eClassName = htmlNode.getAttribute('class');
		switch (eClassName) {
			case 'fck_mw_property' :
				var name = htmlNode.getAttribute('property') || '';
				if (name.indexOf('::') != -1) {
                    var ann = name.substring(name.indexOf('::') + 2);
					if ( emptyVal.exec( ann ) ) return '';
                    if ( ann.Trim() == text.Trim())
                        return '[[' + name + ']]';
					return '[[' + name + '|' + text + ']]' ;
				}
				else {
					if (emptyVal.exec(text)) return '';
					return '[[' + name + '::' + text + ']]' ;
				}
			case 'fck_mw_category' :
				var sort = htmlNode.getAttribute('sort') || '';
                //var labelCategory = smwContentLangForFCK('Category') || 'Category:';
                var labelCategory = 'Category';
                if (sort == text) sort = null;
				if (sort) {
					if (emptyVal.exec(sort)) sort = ' ';
					return '[[' + labelCategory + ':' + text + '|' + sort + ']]';
				}
				if (emptyVal.exec(text)) return '';
				return '[[' + labelCategory + ':' + text + ']]'
		}
	},
    // Get real element from a fake element.
    _getRealElement : function( element ) {

        var attributes = element.attributes;
        var realHtml = attributes && attributes.getNamedItem('data-cke-realelement');
		var realNode = realHtml && decodeURIComponent( realHtml.nodeValue );
        var realElement = realNode && this._getNodeFromHtml( realNode );

 	    // If we have width/height in the element, we must move it into
 	    // the real element.
 	    if ( realElement && element.attributes._cke_resizable ) {
            var style = element.attributes.style;
            if ( style ) {
                // Get the width from the style.
 	            var match = /(?:^|\s)width\s*:\s*(\d+)/i.exec( style ),
                    width = match && match[1];

 	            // Get the height from the style.
 	            match = /(?:^|\s)height\s*:\s*(\d+)/i.exec( style );
 	            var height = match && match[1];

 	            if ( width )
                    realElement.attributes.width = width;

                if ( height )
                    realElement.attributes.height = height;
 	        }
 	    }

 	    return realElement;
    },

    _EscapeWikiMarkup : function (text) {

        // wiki links
        var result, pattern = new RegExp( "\\[\\[.*?\\]\\]", "g" );
		while( result = pattern.exec( text ) ) {
            text = text.replace( result, result.toString().replace( /\[/g, "&#x5B;" ).replace( /\]/g, "&#x5D;") );
        }
        // parameter names (that are written with three curly brackets)
        pattern = new RegExp( "\\{{3}.*?\\}{3}", "g" );
		while( result = pattern.exec( text ) ) {
            text = text.replace( result, result.toString().replace( /\{/g, "&#x7B;" ).replace( /\}/g, "&#x7D;") );
        }
        // all two curly brackets (used for template calls and parser functions)
        while (true) {
            var z = text.match(/\{{2}(.*?)\}{2}/g);
            if (z) {
                for (var i = 0; i < z.length; i++) {
                    text = text.replace(z[i], '&#x7B;&#x7B;' + z[i].substr(2, z[i].length-4) + '&#x7D;&#x7D;');
                }
            }
            else break;
        }
        // escape <> of any html or wiki tag
        text = text.replace( /<(\/?[^>]+)>/g, "&lt;$1&gt;")
        // replace any __MAGICWORD__ with &#95;&#95;MAGICWORD&#95;&#95; - check first if there is any
        if (text.match(/__[A-Z]+__/)) {
            for (var i = 0; i < window.parent.wgCKeditorMagicWords.magicwords.length; i++) {
                pattern = new RegExp('__(' + window.parent.wgCKeditorMagicWords.magicwords[i] + ')__', 'g');
                text = text.replace( pattern, "&#95;&#95;$1&#95;&#95;")
            }
        }
        
        return text;
    },
	
	ieFixHTML: function(html, convertToLowerCase){
		var zz = html;
		var z = zz.match(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g);
		
		if (z) {
			for (var i = 0; i < z.length; i++) {
				var y, zSaved = z[i], attrRE = /\=[a-zA-Z\.\:\[\]_\(\)\&\$\%#\@\!0-9]+[?\s+|?>]/g;
				z[i] = z[i].replace(/(<?\w+)|(<\/?\w+)\s/, function(a){
					return a.toLowerCase();
				});
				y = z[i].match(attrRE);//deze match
				if (y) {
					var j = 0, len = y.length
					while (j < len) {
						var replaceRE = /(\=)([a-zA-Z\.\:\[\]_\(\)\&\$\%#\@\!0-9]+)?([\s+|?>])/g, replacer = function(){
							var args = Array.prototype.slice.call(arguments);
							return '="' + (convertToLowerCase ? args[2].toLowerCase() : args[2]) + '"' + args[3];
						};
						z[i] = z[i].replace(y[j], y[j].replace(replaceRE, replacer));
						j++;
					}
				}
				zz = zz.replace(zSaved, z[i]);
			}
		}
		return zz;
	}

};

if (!String.prototype.InArray) {
	String.prototype.InArray = function(arr) {
		for(var i=0;i<arr.length;i++) {
            if (arr[i] == this)
                return true;
        }
		return false;
	}
}

if (!String.prototype.StartsWith) {
    String.prototype.StartsWith = function(str)
    {return (this.match("^"+str)==str)}
}

if (!String.prototype.EndsWith) {
    String.prototype.EndsWith = function(str)
    {return (this.match(str+"$")==str)}
}

if (!String.prototype.Trim) {
    String.prototype.Trim = function()
    {return this.replace(/^\s*/, '').replace(/\s*$/, '')}
}
if (!String.prototype.IEquals) {
    String.prototype.IEquals = function() {
        for (i = 0; i < String.prototype.IEquals.arguments.length; i++) {
            if (String.prototype.IEquals.arguments[i] == this ) return true;
        }
        return false;
    }
}
if (!String.prototype.FirstToUpper) {
    String.prototype.FirstToUpper = function() {
        string = this;
        return string.substr(0,1).toUpperCase() + string.substr(1);
    }
}

if (!String.prototype.htmlDecode) {
    String.prototype.htmlDecode = function() {
        var entities = new Array ('amp', 'quot', '#039', 'lt', 'gt' );
        var chars = new Array ('&', '"', '\'', '<', '>');
        string = this;
        for (var i = 0; i < entities.length; i++) {
            myRegExp = new RegExp();
            myRegExp.compile('&' + entities[i]+';','g');
            string = string.replace (myRegExp, chars[i]);
        }
        return string;
    }
}

if (!String.prototype.htmlEntities) {
  String.prototype.htmlEntities = function() {
    var chars = new Array ('à','á','â','ã','ä','å','æ','ç','è','é',
                           'ê','ë','ì','í','î','ï','ð','ñ','ò','ó','ô',
                           'õ','ö','ø','ù','ú','û','ü','ý','þ','ÿ','À',
                           'Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë',
                           'Ì','Í','Î','Ï','Ð','Ñ','Ò','Ó','Ô','Õ','Ö',
                           'Ø','Ù','Ú','Û','Ü','Ý','Þ','€','\"','ß',
                           '¢','£','¤','¥','¦','§','¨','©','ª','«',
                           '¬','­','®','¯','°','±','²','³','´','µ','¶',
                           '·','¸','¹','º','»','¼','½','¾');

    var entities = new Array ('agrave','aacute','acirc','atilde','auml','aring',
                              'aelig','ccedil','egrave','eacute','ecirc','euml','igrave',
                              'iacute','icirc','iuml','eth','ntilde','ograve','oacute',
                              'ocirc','otilde','ouml','oslash','ugrave','uacute','ucirc',
                              'uuml','yacute','thorn','yuml','Agrave','Aacute','Acirc',
                              'Atilde','Auml','Aring','AElig','Ccedil','Egrave','Eacute',
                              'Ecirc','Euml','Igrave','Iacute','Icirc','Iuml','ETH','Ntilde',
                              'Ograve','Oacute','Ocirc','Otilde','Ouml','Oslash','Ugrave',
                              'Uacute','Ucirc','Uuml','Yacute','THORN','euro','quot','szlig',
                              'cent','pound','curren','yen','brvbar','sect','uml',
                              'copy','ordf','laquo','not','shy','reg','macr','deg','plusmn',
                              'sup2','sup3','acute','micro','para','middot','cedil','sup1',
                              'ordm','raquo','frac14','frac12','frac34');
//    var chars = new Array ('&','à','á','â','ã','ä','å','æ','ç','è','é',
//                           'ê','ë','ì','í','î','ï','ð','ñ','ò','ó','ô',
//                           'õ','ö','ø','ù','ú','û','ü','ý','þ','ÿ','À',
//                           'Á','Â','Ã','Ä','Å','Æ','Ç','È','É','Ê','Ë',
//                           'Ì','Í','Î','Ï','Ð','Ñ','Ò','Ó','Ô','Õ','Ö',
//                           'Ø','Ù','Ú','Û','Ü','Ý','Þ','€','\"','ß','<',
//                           '>','¢','£','¤','¥','¦','§','¨','©','ª','«',
//                           '¬','­','®','¯','°','±','²','³','´','µ','¶',
//                           '·','¸','¹','º','»','¼','½','¾');
//
//    var entities = new Array ('amp','agrave','aacute','acirc','atilde','auml','aring',
//                              'aelig','ccedil','egrave','eacute','ecirc','euml','igrave',
//                              'iacute','icirc','iuml','eth','ntilde','ograve','oacute',
//                              'ocirc','otilde','ouml','oslash','ugrave','uacute','ucirc',
//                              'uuml','yacute','thorn','yuml','Agrave','Aacute','Acirc',
//                              'Atilde','Auml','Aring','AElig','Ccedil','Egrave','Eacute',
//                              'Ecirc','Euml','Igrave','Iacute','Icirc','Iuml','ETH','Ntilde',
//                              'Ograve','Oacute','Ocirc','Otilde','Ouml','Oslash','Ugrave',
//                              'Uacute','Ucirc','Uuml','Yacute','THORN','euro','quot','szlig',
//                              'lt','gt','cent','pound','curren','yen','brvbar','sect','uml',
//                              'copy','ordf','laquo','not','shy','reg','macr','deg','plusmn',
//                              'sup2','sup3','acute','micro','para','middot','cedil','sup1',
//                              'ordm','raquo','frac14','frac12','frac34');

    string = this;
    for (var i = 0; i < entities.length; i++) {
      myRegExp = new RegExp();
      myRegExp.compile('&' + entities[i]+';','g');
      string = string.replace (myRegExp, chars[i]);
    }
    string = string.replace(/&nbsp;/g, '&#160;');
    return string;
  }
}
