<?php
/**
 * Options for FCKeditor
 * [start with FCKeditor]
 */
define('RTE_VISIBLE', 1);
/**
 * Options for FCKeditor
 * [show toggle link]
 */
define('RTE_TOGGLE_LINK', 2);
/**
 * Options for FCKeditor
 * [show popup link]
 */
define('RTE_POPUP', 4);

class CKeditor_MediaWiki {
	public $showFCKEditor;
    public $loadSTBonStartup;
	private $count = array();
	private $wgFCKBypassText = '';
	private $debug = 0;
	private $excludedNamespaces;
	private $oldTextBox1;
	static $nsToggles = array(
	'riched_disable_ns_main',
	'riched_disable_ns_talk',
	'riched_disable_ns_user',
	'riched_disable_ns_user_talk',
	'riched_disable_ns_project',
	'riched_disable_ns_project_talk',
	'riched_disable_ns_image',
	'riched_disable_ns_image_talk',
	'riched_disable_ns_mediawiki',
	'riched_disable_ns_mediawiki_talk',
	'riched_disable_ns_template',
	'riched_disable_ns_template_talk',
	'riched_disable_ns_help',
	'riched_disable_ns_help_talk',
	'riched_disable_ns_category',
	'riched_disable_ns_category_talk',
	);

	function __call( $m, $a ) {
		print "\n#### " . $m . "\n";
		if( !isset( $this->count[$m] ) ) {
			$this->count[$m] = 0;
		}
		$this->count[$m]++;
		return true;
	}

	/**
	 * Gets the namespaces where FCKeditor should be disabled
	 * First check is done against user preferences, second is done against the global variable $wgFCKEditorExcludedNamespaces
	 */
	private function getExcludedNamespaces() {
		global $wgUser, $wgDefaultUserOptions, $wgFCKEditorExcludedNamespaces;

		if( is_null( $this->excludedNamespaces ) ) {
			$this->excludedNamespaces = array();
			foreach( self::$nsToggles as $toggle ) {
				$default = isset( $wgDefaultUserOptions[$toggle] ) ? $wgDefaultUserOptions[$toggle] : '';
				if( $wgUser->getOption( $toggle, $default ) ) {
					$this->excludedNamespaces[] = constant( strtoupper( str_replace( 'riched_disable_', '', $toggle ) ) );
				}
			}
			/*
			If this site's LocalSettings.php defines Namespaces that shouldn't use the FCKEditor (in the #wgFCKexcludedNamespaces array), those excluded
			namespaces should be combined with those excluded in the user's preferences.
			*/
			if( !empty( $wgFCKEditorExcludedNamespaces ) && is_array( $wgFCKEditorExcludedNamespaces ) ) {
				$this->excludedNamespaces = array_merge( $wgFCKEditorExcludedNamespaces, $this->excludedNamespaces );
			}
		}

		return $this->excludedNamespaces;
	}

	public static function onLanguageGetMagic( &$magicWords, $langCode ) {
		$magicWords['NORICHEDITOR'] = array( 0, '__NORICHEDITOR__' );

		return true;
	}

	public static function onParserBeforeInternalParse( &$parser, &$text, &$strip_state ) {
		MagicWord::get( 'NORICHEDITOR' )->matchAndRemove( $text );

		return true;
	}

	public function onEditPageShowEditFormFields( $pageEditor, $wgOut ) {
		global $wgUser, $wgFCKEditorIsCompatible, $wgTitle;

		/*
		If FCKeditor extension is enabled, BUT it shouldn't appear (because it's disabled by user, we have incompatible browser etc.)
		We must do this trick to show the original text as WikiText instead of HTML when conflict occurs
		*/
		if ( ( !$wgUser->getOption( 'showtoolbar' ) || $wgUser->getOption( 'riched_disable' ) || !$wgFCKEditorIsCompatible ) ||
				in_array( $wgTitle->getNamespace(), $this->getExcludedNamespaces() ) || !( $this->showFCKEditor & RTE_VISIBLE ) ||
				false !== strpos( $pageEditor->textbox1, '__NORICHEDITOR__' )
			) {
			if( $pageEditor->isConflict ) {
				$pageEditor->textbox1 = $pageEditor->getWikiContent();
			}
		}

		return true;
	}

	/**
	 * @param $pageEditor EditPage instance
	 * @param $out OutputPage instance
	 * @return true
	 */
	public static function onEditPageBeforeConflictDiff( $pageEditor, $out ) {
		global $wgRequest;

		/*
		Show WikiText instead of HTML when there is a conflict
		http://dev.fckeditor.net/ticket/1385
		*/
		$pageEditor->textbox2 = $wgRequest->getVal( 'wpTextbox1' );
		$pageEditor->textbox1 = $pageEditor->getWikiContent();

		return true;
	}

	#public static function onParserBeforeStrip( &$parser, &$text, &$stripState ) {
	#	$text = $parser->strip( $text, $stripState );
	#	return true;
	# }
	        public static function onParserBeforeStrip( &$parser, &$text, &$stripState ) {
#               $text = $parser->strip( $text, $stripState );
               if (get_class($parser) == 'CKeditorParser') {
                       $text = $parser->strip( $text, $stripState );
               }
                return true;
        }

	public static function onSanitizerAfterFixTagAttributes( $text, $element, &$attribs ) {
		$text = preg_match_all( "/Fckmw\d+fckmw/", $text, $matches );

		if( !empty( $matches[0][0] ) ) {
			global $leaveRawTemplates;
			if( !isset( $leaveRawTemplates ) ) {
				$leaveRawTemplates = array();
			}
			$leaveRawTemplates = array_merge( $leaveRawTemplates, $matches[0] );
			$attribs = array_merge( $attribs, $matches[0] );
		}

		return true;
	}

    // we need to move our hook onBeforePageDisplay at the end of the list so that
    // style sheets are already inserted into the out object.
    public static function onOutputPageParserOutput( &$out, $parseroutput ) {
        global $wgHooks;
        $noHooks = count($wgHooks['BeforePageDisplay']);
        if ($wgHooks['BeforePageDisplay'][$noHooks - 1] != 'CKeditor_MediaWiki::onBeforePageDisplay') {
            $BeforePageDisplay = array();
            for ( $i = 0; $i < $noHooks; $i++ ) {
                if ($wgHooks['BeforePageDisplay'][$i] == 'CKeditor_MediaWiki::onBeforePageDisplay')
                    continue;
                $BeforePageDisplay[] = $wgHooks['BeforePageDisplay'][$i];
            }
            $wgHooks['BeforePageDisplay'] = $BeforePageDisplay;
            $wgHooks['BeforePageDisplay'][] = 'CKeditor_MediaWiki::onBeforePageDisplay';
            return true;
        }
        return true;
    }

    // take content of css files and put this as inline text into the page, instead
    // of using the link elements to fetch css files separate from the server.
    // The latter causes IE to hang when more than 31 style sheets are processed this way.
    public static function onBeforePageDisplay( &$out, &$text ) {
        global $wgRequest, $wgScriptPath;
        //var_dump($out->styles);
        $action = $wgRequest->getText( 'action' );
        if (! in_array($action, array('edit', 'submit'))) return $out;
        $inlineStyles = array();
        foreach ( $out->styles as $key => $val ) {
            if (count($out->styles[$key]) > 0) {
                if (isset($out->styles[$key]['condition']) ||
                    isset($out->styles[$key]['dir']) ||
                    strpos($key, '?') !== false ||
                    strpos($key, 'jquery.fancybox') !== false) continue;
                $count = 1;
                $cssFile = dirname(__FILE__) . '/../../' . str_replace($wgScriptPath, '', $key, $count);
                $cssFile = str_replace('//', '/', $cssFile);
                if (isset($out->styles[$key]['media']) &&
                    file_exists($cssFile)) {
                    $cssCont = file_get_contents($cssFile);
                    if ($cssCont !== false) {
                        if (! isset($inlineStyles[$out->styles[$key]['media']]))
                            $inlineStyles[$out->styles[$key]['media']] = '';
                        $inlineStyles[$out->styles[$key]['media']] .= $cssCont."\n";
                        unset($out->styles[$key]);
                    }
                }
            }
        }
        foreach($inlineStyles as $media => $css ) {
            $out->addInlineStyle( $css );
        }
        return $out;
    }

        public function onCustomEditor( $article, $user ) {
#-               global $wgRequest, $mediaWiki;
              global $wgRequest, $wgUseExternalEditor;
 
#-               $action = $mediaWiki->getVal( 'Action' );
               $action = $wgRequest->getVal( 'action', 'view' );
 
                $internal = $wgRequest->getVal( 'internaledit' );
                $external = $wgRequest->getVal( 'externaledit' );
                $section = $wgRequest->getVal( 'section' );
                $oldid = $wgRequest->getVal( 'oldid' );
#-               if( !$mediaWiki->getVal( 'UseExternalEditor' ) || $action == 'submit' || $internal ||
              if( !$wgUseExternalEditor || $action == 'submit' || $internal ||
                $section || $oldid || ( !$user->getOption( 'externaleditor' ) && !$external ) ) {
                        $editor = new CKeditorEditPage( $article );
#-                       $editor->submit();
#-               } elseif( $mediaWiki->getVal( 'UseExternalEditor' ) && ( $external || $user->getOption( 'externaleditor' ) ) ) {
#-                       $mode = $wgRequest->getVal( 'mode' );
#-                       $extedit = new ExternalEdit( $article, $mode );
#-                       $extedit->edit();
                       $editor->edit();
                       return false;
              } else {
                       return true;
                }
#-
#-               return false;
        }

    public static function onDoEditSectionLink ($skin, $title, $section, $tooltip, $result, $lang = false ) {
        global $wgCKEditorUrlparamMode;
        if (isset($wgCKEditorUrlparamMode) && $wgCKEditorUrlparamMode === true) {
            $result = str_replace( '&amp;action=edit', '&amp;action=edit&amp;mode=wysiwyg', $result);
        }
        return true;
    }
    
	public function onEditPageBeforePreviewText( &$editPage, $previewOnOpen ) {
		global $wgUser, $wgRequest;

		if( $wgUser->getOption( 'showtoolbar' ) && !$wgUser->getOption( 'riched_disable' ) && !$previewOnOpen ) {
			$this->oldTextBox1 = $editPage->textbox1;
			$editPage->importFormData( $wgRequest );
		}

		return true;
	}

	public function onEditPagePreviewTextEnd( &$editPage, $previewOnOpen ) {
		global $wgUser;

		if( $wgUser->getOption( 'showtoolbar' ) && !$wgUser->getOption( 'riched_disable' ) && !$previewOnOpen ) {
			$editPage->textbox1 = $this->oldTextBox1;
		}

		return true;
	}

	public function onParserAfterTidy( &$parser, &$text ) {
		global $wgUseTeX, $wgUser, $wgTitle, $wgFCKEditorIsCompatible;

        MagicWord::get( 'NORICHEDITOR' )->matchAndRemove( $text );
        
		# Don't initialize for users that have chosen to disable the toolbar, rich editor or that do not have a FCKeditor-compatible browser
		if( !$wgUser->getOption( 'showtoolbar' ) || $wgUser->getOption( 'riched_disable' ) || !$wgFCKEditorIsCompatible ) {
			return true;
		}

		# Are we editing a page that's in an excluded namespace? If so, bail out.
		if( is_object( $wgTitle ) && in_array( $wgTitle->getNamespace(), $this->getExcludedNamespaces() ) ) {
			return true;
		}

		if( $wgUseTeX ) {
			// it may add much overload on page with huge amount of math content...
			$text = preg_replace( '/<img class="tex" alt="([^"]*)"/m', '<img _fckfakelement="true" _fck_mw_math="$1"', $text );
			$text = preg_replace( "/<img class='tex' src=\"([^\"]*)\" alt=\"([^\"]*)\"/m", '<img src="$1" _fckfakelement="true" _fck_mw_math="$2"', $text );
		}

		return true;
	}

	/**
	 * Adds some new JS global variables
	 * @param $vars Array: array of JS global variables
	 * @return true
	 */
	public static function onMakeGlobalVariablesScript( $vars ){
		global $wgFCKEditorDir, $wgFCKEditorExtDir, $wgFCKEditorToolbarSet, $wgFCKEditorHeight,
               $wgAllowExternalImages, $wgAllowExternalImagesFrom, $wgCKEditorHideDisabledTbutton;

		$vars['wgFCKEditorDir'] = $wgFCKEditorDir;
		$vars['wgFCKEditorExtDir'] = $wgFCKEditorExtDir;
		$vars['wgFCKEditorToolbarSet'] = $wgFCKEditorToolbarSet;
		$vars['wgFCKEditorHeight'] = $wgFCKEditorHeight;
        $ckParser = new CKeditorParser();
        $vars['wgCKeditorMagicWords'] = array(
            'wikitags' => $ckParser->getSpecialTags(),
            'magicwords' => $ckParser->getMagicWords(),
            'datevars' => $ckParser->getDateTimeVariables(),
            'wikivars' => $ckParser->getWikiVariables(),
            'parserhooks' => $ckParser->getFunctionHooks()
        );
        if (defined('SF_VERSION'))
           $vars['wgCKeditorMagicWords']['sftags'] = $ckParser->getSfSpecialTags();
        $instExt = array();
        if (defined('SMW_DI_VERSION'))
            $instExt[] = 'SMW_DI_VERSION';
        if (defined('SMW_HALO_VERSION'))
            $instExt[] = 'SMW_HALO_VERSION';
        if (defined('SMW_RM_VERSION'))
            $instExt[] = 'SMW_RM_VERSION';
        if (defined('SEMANTIC_RULES_VERSION'))
            $instExt[] = 'SEMANTIC_RULES_VERSION';
        $vars['wgCKeditorUseBuildin4Extensions'] = $instExt;
        // check if external images are allowed
        if ($wgAllowExternalImages)
            $vars['wgAllowExternalImages'] = true;
        else if ($wgAllowExternalImagesFrom)
            $vars['wgAllowExternalImagesFrom'] = $wgAllowExternalImagesFrom;
        if ($wgCKEditorHideDisabledTbutton)
            $vars['wgCKEditorHideDisabledTbutton'] = true;
		return true;
	}

	/**
	 * Adds new toggles into Special:Preferences
	 * @param $user User object
	 * @param $preferences Preferences object
	 * @return true
	 */
	public static function onGetPreferences( $user, &$preferences ){
		global $wgDefaultUserOptions;
		# wfLoadExtensionMessages( 'CKeditor' );

		$preferences['riched_disable'] = array(
			'type' => 'toggle',
			'section' => 'editing/fckeditor',
			'label-message' => 'tog-riched_disable',
		);

		$preferences['riched_start_disabled'] = array(
			'type' => 'toggle',
			'section' => 'editing/fckeditor',
			'label-message' => 'tog-riched_start_disabled',
		);

		$preferences['riched_use_popup'] = array(
			'type' => 'toggle',
			'section' => 'editing/fckeditor',
			'label-message' => 'tog-riched_use_popup',
		);

		$preferences['riched_use_toggle'] = array(
			'type' => 'toggle',
			'section' => 'editing/fckeditor',
			'label-message' => 'tog-riched_use_toggle',
		);

		$preferences['riched_toggle_remember_state'] = array(
			'type' => 'toggle',
			'section' => 'editing/fckeditor',
			'label-message' => 'tog-riched_toggle_remember_state',
		);

        if (defined('SMW_HALO_VERSION')) {
            $preferences['riched_load_semantic_toolbar'] = array(
                'type' => 'toggle',
    			'section' => 'editing/fckeditor',
        		'label-message' => 'load-stb-on-startup',
            );
        }

		// Show default options in Special:Preferences
		if( !array_key_exists( 'riched_disable', $user->mOptions ) && !empty( $wgDefaultUserOptions['riched_disable'] ) )
			$user->setOption( 'riched_disable', $wgDefaultUserOptions['riched_disable'] );
		if( !array_key_exists( 'riched_start_disabled', $user->mOptions ) && !empty( $wgDefaultUserOptions['riched_start_disabled'] ) )
			$user->setOption( 'riched_start_disabled', $wgDefaultUserOptions['riched_start_disabled'] );
		if( !array_key_exists( 'riched_use_popup', $user->mOptions ) && !empty( $wgDefaultUserOptions['riched_use_popup'] ) )
			$user->setOption( 'riched_use_popup', $wgDefaultUserOptions['riched_use_popup'] );
		if( !array_key_exists( 'riched_use_toggle', $user->mOptions ) && !empty( $wgDefaultUserOptions['riched_use_toggle'] ) )
			$user->setOption( 'riched_use_toggle', $wgDefaultUserOptions['riched_use_toggle'] );
		if( !array_key_exists( 'riched_toggle_remember_state', $user->mOptions ) && !empty( $wgDefaultUserOptions['riched_toggle_remember_state'] ) )
			$user->setOption( 'riched_toggle_remember_state', $wgDefaultUserOptions['riched_toggle_remember_state'] );

		// Add the "disable rich editor on namespace X" toggles too
		foreach( self::$nsToggles as $newToggle ){
			$preferences[$newToggle] = array(
				'type' => 'toggle',
				'section' => 'editing/fckeditor',
				'label-message' => 'tog-' . $newToggle
			);
		}

		return true;
	}

	/**
	 * Add FCK script
	 *
	 * @param $form EditPage object
	 * @return true
	 */
	public function onEditPageShowEditFormInitial( $form ) {
		global $wgOut, $wgTitle, $wgScriptPath, $wgContLang, $wgUser;
		global $wgStylePath, $wgStyleVersion, $wgDefaultSkin, $wgExtensionFunctions, $wgHooks, $wgDefaultUserOptions;
		global $wgFCKWikiTextBeforeParse, $wgFCKEditorIsCompatible;
		global $wgFCKEditorExtDir, $wgFCKEditorDir, $wgFCKEditorHeight, $wgFCKEditorToolbarSet;
        global $wgCKEditorUrlparamMode, $wgRequest;

		if( !isset( $this->showFCKEditor ) ){
			$this->showFCKEditor = 0;
			if ( !$wgUser->getOption( 'riched_start_disabled', $wgDefaultUserOptions['riched_start_disabled'] ) ) {
				$this->showFCKEditor += RTE_VISIBLE;
			}
			if ( $wgUser->getOption( 'riched_use_popup', $wgDefaultUserOptions['riched_use_popup'] ) ) {
				$this->showFCKEditor += RTE_POPUP;
			}
			if ( $wgUser->getOption( 'riched_use_toggle', $wgDefaultUserOptions['riched_use_toggle'] ) ) {
				$this->showFCKEditor += RTE_TOGGLE_LINK;
			}
		}
        if (!isset( $this->loadSTBonStartup ) ) {
            $this->loadSTBonStartup = 0;
			if (defined('SMW_HALO_VERSION'))
            if ( $wgUser->getOption( 'riched_load_semantic_toolbar', $wgDefaultUserOptions['riched_load_semantic_toolbar'] ) ) {
				$this->loadSTBonStartup = 1;
			}
        }

		if( ( !empty( $_SESSION['showMyFCKeditor'] ) ) && ( $wgUser->getOption( 'riched_toggle_remember_state', $wgDefaultUserOptions['riched_toggle_remember_state'] ) ) ){
            $rteSettingsFromSession=true;
			// Clear RTE_VISIBLE flag
			$this->showFCKEditor &= ~RTE_VISIBLE;
			// Get flag from session
			$this->showFCKEditor |= $_SESSION['showMyFCKeditor'];
		}

		# Don't initialize if we have disabled the toolbar or FCkeditor or have a non-compatible browser
		if( !$wgUser->getOption( 'showtoolbar' ) ||
		$wgUser->getOption( 'riched_disable', !empty( $wgDefaultUserOptions['riched_disable'] ) ? $wgDefaultUserOptions['riched_disable'] : false )
		|| !$wgFCKEditorIsCompatible ) {
			return true;
		}

		# Don't do anything if we're in an excluded namespace
		if( in_array( $wgTitle->getNamespace(), $this->getExcludedNamespaces() ) ) {
			return true;
		}

		# Make sure that there's no __NORICHEDITOR__ in the text either
		if( false !== strpos( $form->textbox1, '__NORICHEDITOR__' ) ) {
			return true;
		}

        # If $wgCKEditorUrlparamMode is set to true check the url params
        if ( $wgCKEditorUrlparamMode && !( $wgRequest->getVal('mode') && $wgRequest->getVal('mode') == 'wysiwyg' ) ) {
            return true;
        }
        # If mode=wysiwyg is set then start with the WYSIWYG editor
        if ( $wgRequest->getVal('mode') && $wgRequest->getVal('mode') == 'wysiwyg' && !isset($rteSettingsFromSession)) {
            $this->showFCKEditor |= RTE_VISIBLE;
        }

		$wgFCKWikiTextBeforeParse = $form->textbox1;
		if( $this->showFCKEditor & RTE_VISIBLE ){
			$options = new CKeditorParserOptions();
			$options->setTidy( true );
			$parser = new CKeditorParser();
			$parser->setOutputType( OT_HTML );
			$form->textbox1 = str_replace( '<!-- Tidy found serious XHTML errors -->', '', $parser->parse( $form->textbox1, $wgTitle, $options )->getText() );
		}

		$printsheet = htmlspecialchars( "$wgStylePath/common/wikiprintable.css?$wgStyleVersion" );

		// CSS trick,  we need to get user CSS stylesheets somehow... it must be done in a different way!
		$skin = $wgUser->getSkin();
		$skin->loggedin = $wgUser->isLoggedIn();
		$skin->mTitle =& $wgTitle;
		$skin->initPage( $wgOut );
		$skin->userpage = $wgUser->getUserPage()->getPrefixedText();
#   $skin->setupUserCss( $wgOut );
    $skin->setupSkinUserCss( $wgOut );

		if( !empty( $skin->usercss ) && preg_match_all( '/@import "([^"]+)";/', $skin->usercss, $matches ) ) {
			$userStyles = $matches[1];
		}
		// End of CSS trick

		$script = <<<HEREDOC
<script type="text/javascript" src="$wgScriptPath/${wgFCKEditorDir}ckeditor.js"></script>
<!--<script type="text/javascript" src="$wgScriptPath/${wgFCKEditorDir}ckeditor_source.js"></script>-->
<script type="text/javascript">
var sEditorAreaCSS = '$printsheet,/mediawiki/skins/monobook/main.css?{$wgStyleVersion}';
</script>
<!--[if lt IE 5.5000]><script type="text/javascript">sEditorAreaCSS += ',/mediawiki/skins/monobook/IE50Fixes.css?{$wgStyleVersion}'; </script><![endif]-->
<!--[if IE 5.5000]><script type="text/javascript">sEditorAreaCSS += ',/mediawiki/skins/monobook/IE55Fixes.css?{$wgStyleVersion}'; </script><![endif]-->
<!--[if IE 6]><script type="text/javascript">sEditorAreaCSS += ',/mediawiki/skins/monobook/IE60Fixes.css?{$wgStyleVersion}'; </script><![endif]-->
<!--[if IE 7]><script type="text/javascript">sEditorAreaCSS += ',/mediawiki/skins/monobook/IE70Fixes.css?{$wgStyleVersion}'; </script><![endif]-->
<!--[if lt IE 7]><script type="text/javascript">sEditorAreaCSS += ',/mediawiki/skins/monobook/IEFixes.css?{$wgStyleVersion}'; </script><![endif]-->
HEREDOC;

		$script .= '<script type="text/javascript"> ';
		if( !empty( $userStyles ) ) {
			$script .= 'sEditorAreaCSS += ",' . implode( ',', $userStyles ) . '";';
		}

		# Show references only if Cite extension has been installed
		$showRef = false;
		if( ( isset( $wgHooks['ParserFirstCallInit'] ) && in_array( 'wfCite', $wgHooks['ParserFirstCallInit'] ) ) ||
		( isset( $wgExtensionFunctions ) && in_array( 'wfCite', $wgExtensionFunctions ) ) ) {
			$showRef = true;
		}

		$showSource = false;
		if ( ( isset( $wgHooks['ParserFirstCallInit']) && in_array( 'efSyntaxHighlight_GeSHiSetup', $wgHooks['ParserFirstCallInit'] ) )
			|| ( isset( $wgExtensionFunctions ) && in_array( 'efSyntaxHighlight_GeSHiSetup', $wgExtensionFunctions ) ) ) {
			$showSource = true;
		}

		# wfLoadExtensionMessages( 'CKeditor' );
		$script .= '
var showFCKEditor = ' . $this->showFCKEditor . ';
var loadSTBonStartup = '. $this->loadSTBonStartup . ';
var popup = false; // pointer to popup document
var firstLoad = true;
var editorMsgOn = "' . Xml::escapeJsString( wfMsgHtml( 'textrichditor' ) ) . '";
var editorMsgOff = "' . Xml::escapeJsString( wfMsgHtml( 'tog-riched_disable' ) ) . '";
var editorLink = "' . ( ( $this->showFCKEditor & RTE_VISIBLE ) ? Xml::escapeJsString( wfMsgHtml( 'tog-riched_disable' ) ) : Xml::escapeJsString( wfMsgHtml( 'textrichditor' ) ) ) . '";
var saveSetting = ' . ( $wgUser->getOption( 'riched_toggle_remember_state', $wgDefaultUserOptions['riched_toggle_remember_state']  ) ?  1 : 0 ) . ';
var RTE_VISIBLE = ' . RTE_VISIBLE . ';
var RTE_TOGGLE_LINK = ' . RTE_TOGGLE_LINK . ';
var RTE_POPUP = ' . RTE_POPUP . ';
var wgCKeditorInstance = null;
var wgCKeditorCurrentMode = "wysiwyg";
var smwghQiLoadUrl = "'. CKeditor_MediaWiki::GetQILoadUrl() .'";
CKEDITOR.ready=true;

';
		$script .= '</script>';

        $script .= '<script type="text/javascript">';
        $script .= $this->InitializeScripts('wpTextbox1', Xml::escapeJsString( wfMsgHtml( 'rich_editor_new_window' ) ) );

if( $this->showFCKEditor & ( RTE_TOGGLE_LINK | RTE_POPUP ) ){
	// add toggle link and handler
    $script .= $this->ToggleScript();
}

if( $this->showFCKEditor & RTE_POPUP ){
	$script .= <<<HEREDOC

function FCKeditor_OpenPopup(jsID, textareaID){
	popupUrl = wgFCKEditorExtDir + '/CKeditor.popup.html';
	popupUrl = popupUrl + '?var='+ jsID + '&el=' + textareaID;
	window.open(popupUrl, null, 'toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=1,dependent=yes');
	return 0;
}
HEREDOC;
}
$script .= '</script>';

		$wgOut->addScript( $script );

		return true;
	}

    private static function GetQILoadUrl() {
        global $smwgQueryInterfaceSecret, $smwgHaloIP;
        $qiUrl = '?action=ajax&rs=smwf_qi_getPage&rsargs[]=CKE';
        if (isset($smwgQueryInterfaceSecret)) {
            require_once $smwgHaloIP.'/specials/SMWQueryInterface/SMW_QIAjaxAccess.php';
            list($token, $hash) = qiCreateHash();
            return $qiUrl.'&s='.$token.'&t='. $hash;
        }
        return $qiUrl;
    }

    public static function InitializeScripts($textfield, $newWinMsg) {
        global $wgFCKEditorHeight;
        $ckeHeight = (empty($wgFCKEditorHeight)) ? 0 : $wgFCKEditorHeight;
		$script = <<<HEREDOC

//IE hack to call func from popup
function FCK_sajax(func_name, args, target) {
	sajax_request_type = 'POST';
	sajax_do_call(func_name, args, function (x) {
		// I know this is function, not object
		target(x);
		}
	);
}

// qi url tokens

function onLoadCKeditor(){
	if( !( showFCKEditor & RTE_VISIBLE ) )
		showFCKEditor += RTE_VISIBLE;
	firstLoad = false;
	realTextarea = document.getElementById( '$textfield' );
	if ( realTextarea ){
		var height = $ckeHeight;
		realTextarea.style.display = 'none';
		if ( height == 0 ){
			// Get the window (inner) size.
			var height = window.innerHeight || ( document.documentElement && document.documentElement.clientHeight ) || 550;

			// Reduce the height to the offset of the toolbar.
			var offset = document.getElementById( 'wikiPreview' ) || document.getElementById( 'toolbar' );
			while ( offset ){
				height -= offset.offsetTop;
				offset = offset.offsetParent;
			}

			// Add a small space to be left in the bottom.
			height -= 20;
		}

		// Enforce a minimum height.
		height = ( !height || height < 300 ) ? 300 : height;

		// Create the editor instance and replace the textarea.
		realTextarea.style.height = height;
		wgCKeditorInstance = CKEDITOR.replace(realTextarea);

		// Hide the default toolbar.
        var toolbar = document.getElementById( 'toolbar' );
		if ( toolbar ) toolbar.style.display = 'none';

	}
    // enable semantic toolbar in the editor after 2s
    if ( loadSTBonStartup ) {
        setTimeout(function() {
            wgCKeditorInstance.execCommand('SMWtoolbar');
        }, 2000);
    }
}
function checkSelected(){
	if( !selText ) {
		selText = sampleText;
		isSample = true;
	} else if( selText.charAt(selText.length - 1) == ' ' ) { //exclude ending space char
		selText = selText.substring(0, selText.length - 1);
		tagClose += ' '
	}
}
function initEditor(){
	var toolbar = document.getElementById( 'toolbar' );
	// show popup or toogle link
	if( showFCKEditor & ( RTE_POPUP|RTE_TOGGLE_LINK ) ){
		// add new toolbar before wiki toolbar
		var ckTools = document.createElement( 'div' );
		ckTools.setAttribute('id', 'ckTools');
		var SRCtextarea = document.getElementById( '$textfield' );
        if (toolbar) toolbar.parentNode.insertBefore( ckTools, toolbar );
        else SRCtextarea.parentNode.insertBefore( ckTools, SRCtextarea );
		if( showFCKEditor & RTE_VISIBLE ) SRCtextarea.style.display = 'none';
	}

	if( showFCKEditor & RTE_TOGGLE_LINK ){
		ckTools.innerHTML='[<a class="fckToogle" id="toggle_$textfield" href="javascript:void(0)" onclick="ToggleCKEditor(\'toggle\',\'$textfield\')">'+ editorLink +'</a>] ';
	}
    /*
	if( showFCKEditor & RTE_POPUP ){
		var style = (showFCKEditor & RTE_VISIBLE) ? 'style="display:none"' : "";
		ckTools.innerHTML+='<span ' + style + ' id="popup_$textfield">[<a class="fckPopup" href="javascript:void(0)" onclick="ToggleCKEditor(\'popup\',\'$textfield\')">{$newWinMsg}</a>]</span>';
	}
    */
	if( showFCKEditor & RTE_VISIBLE ){
		if ( toolbar ){	// insert wiki buttons
			for( var i = 0; i < mwEditButtons.length; i++ ) {
				mwInsertEditButton(toolbar, mwEditButtons[i]);
			}
			for( var i = 0; i < mwCustomEditButtons.length; i++ ) {
				mwInsertEditButton(toolbar, mwCustomEditButtons[i]);
			}
		}
		onLoadCKeditor();
	}
	return true;
}
addOnloadHook( initEditor );

HEREDOC;

        return $script;
    }
    public static function ToggleScript() {
        $script = <<<HEREDOC

function ToggleCKEditor( mode, objId ){
  if (typeof window.toggleRTESemaphore !== 'undefined') {
    if (window.toggleRTESemaphore === true) {
      return false;
    }
  } 
  window.toggleRTESemaphore = true;
  document.getElementById('ckTools').style.display='none';
  
  setTimeout(function() {
      window.toggleRTESemaphore = false;
      document.getElementById('ckTools').style.display='block';
    }, 2000);
	var SRCtextarea = document.getElementById( objId );
	if( mode == 'popup' ){
		if ( ( showFCKEditor & RTE_VISIBLE ) && ( CKEDITOR.status == 'basic_ready' ) ) { // if CKeditor is up-to-date
			var oEditorIns = CKEDITOR.instances[objId];
			var text = oEditorIns.getData();
			SRCtextarea.value = text; // copy text to textarea
		}
		FCKeditor_OpenPopup('CKEDITOR', objId);
		return true;
	}

	var oToggleLink = document.getElementById( 'toggle_' + objId );
	var oPopupLink = document.getElementById( 'popup_' + objId );

	if ( firstLoad ){
		// firstLoad = true => FCKeditor start invisible
		if( oToggleLink ) oToggleLink.innerHTML = 'Loading...';
		sajax_request_type = 'POST';
		CKEDITOR.ready = false;
		sajax_do_call('wfSajaxWikiToHTML', [SRCtextarea.value], function( result ){
			if ( firstLoad ){ //still
				SRCtextarea.value = result.responseText; // insert parsed text
				onLoadCKeditor();
				if( oToggleLink ) oToggleLink.innerHTML = editorMsgOff;
				CKEDITOR.ready = true;
			}
		});
		return true;
	}

	if( ! CKEDITOR.ready ) {
    return false; // sajax_do_call in action
  }
	if( ! (CKEDITOR.status == 'basic_ready') ) {
    return false; // not loaded yet
  }
	var oEditorIns = CKEDITOR.instances[objId];
	var oEditorIframe  = document.getElementById( 'cke_' + objId );
	var toolbar = document.getElementById( 'toolbar' );
	var bIsWysiwyg = ( oEditorIns.mode == 'wysiwyg' );

	//CKeditor visible -> hidden
	if ( showFCKEditor & RTE_VISIBLE ){
		var text = oEditorIns.getData();
		SRCtextarea.value = text;
		if( saveSetting ){
			sajax_request_type = 'GET';
			sajax_do_call( 'wfSajaxToggleCKeditor', ['hide'], function(){} ); //remember closing in session
		}
		if( oToggleLink ) oToggleLink.innerHTML = editorMsgOn;
		if( oPopupLink ) oPopupLink.style.display = '';
		showFCKEditor -= RTE_VISIBLE;
		oEditorIframe.style.display = 'none';
		if (toolbar) {
            toolbar.style.display = 'inline';
            toolbar.style.visibility = 'visible';
        }
		SRCtextarea.style.display = 'inline';
        SRCtextarea.style.visibility = 'visible';
        if (CKEDITOR.plugins.smwtoolbar) {
            CKEDITOR.plugins.smwtoolbar.stbIsActive = false;
            smwhgAnnotationHints = new AnnotationHints();
            propToolBar = new PropertiesToolBar();
            AdvancedAnnotation.unload();
            AdvancedAnnotation.create();
            stb_control.stbconstructor();
            stb_control.createForcedHeader();
            obContributor.registerContributor();
            relToolBar.callme();
            catToolBar.callme();
            propToolBar.callme();
            smwhgASKQuery.createContainer();
            // webservice toolbar, only available if DataImport extension is included
            if (typeof wsToolBar != 'undefined')
                wsToolBar.callme();
            // rule toolbar, only available if SemanticRuls extension is included
            if (typeof ruleToolBar != 'undefined')
                ruleToolBar.callme();
            // Annotations toolbar, only if SemanticGardening extension is included
            if (typeof smwhgGardeningHints != 'undefined')
                smwhgGardeningHints.createContainer();
            smw_links_callme();
            gEditInterface = new SMWEditInterface();
            obContributor.activateTextArea(SRCtextarea);
            smwhg_dragresizetoolbar.draggable=null;
            smwhg_dragresizetoolbar.callme();
        }
	} else {
		// FCKeditor hidden -> visible
		//if ( bIsWysiwyg ) oEditorIns.SwitchEditMode(); // switch to plain
		SRCtextarea.style.display = 'none';
		// copy from textarea to FCKeditor
		oEditorIns.setData( SRCtextarea.value );
		if (toolbar) toolbar.style.display = 'none';
		oEditorIframe.style.display = '';
		//if ( !bIsWysiwyg ) oEditorIns.SwitchEditMode();	// switch to WYSIWYG
		showFCKEditor += RTE_VISIBLE; // showFCKEditor+=RTE_VISIBLE
		if( oToggleLink ) oToggleLink.innerHTML = editorMsgOff;
		if( oPopupLink ) oPopupLink.style.display = 'none';
        if (typeof AdvancedAnnotation != 'undefined')
            AdvancedAnnotation.unload();
        if ( loadSTBonStartup )
            CKEDITOR.instances[objId].execCommand('SMWtoolbar');
	}

	return true;
}

HEREDOC;
    return $script;
}

}
