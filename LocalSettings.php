<?php
# error_reporting( -1 );
# ini_set( 'display_errors', 1 );
# $wgDebugToolbar = true;
# $wgShowDebug = true;
# $wgDebugLogFile = "~/debsoc-wiki.logs";
$LOCAL_DEV = getenv('LOCAL_NOT_HEROKU');
if ($LOCAL_DEV) {
   die("wtf?");
}
else { die("Hmm.."); }
# This file was automatically generated by the MediaWiki 1.21.1
# installer. If you make manual changes, please keep track in case you
# need to recreate them later.
#
# See includes/DefaultSettings.php for all configurable settings
# and their default values, but don't forget to make changes in _this_
# file, not there.
#
# Further documentation for configuration settings may be found at:
# http://www.mediawiki.org/wiki/Manual:Configuration_settings

# Protect against web entry
if ( !defined( 'MEDIAWIKI' ) ) {
	exit;
}

## Uncomment this to disable output compression
# $wgDisableOutputCompression = true;

$wgSitename = "Debsoc Wiki";
$wgMetaNamespace = "Debsoc_Wiki";

## The URL base path to the directory containing the wiki;
## defaults for all runtime URL paths are based off of this.
## For more information on customizing the URLs
## (like /w/index.php/Page_title to /wiki/Page_title) please see:
## http://www.mediawiki.org/wiki/Manual:Short_URL
$wgScriptPath = "";
$wgScriptExtension = ".php";

## The protocol and server name to use in fully-qualified URLs
if (!$LOCAL_DEV) {
$wgServer = "http://debsoc-mediawiki.herokuapp.com";
} else {
$wgServer = "http://localhost";
}
## The relative URL path to the skins directory
$wgStylePath = "$wgScriptPath/skins";

## The relative URL path to the logo.  Make sure you change this from the default,
## or else you'll overwrite your logo when you upgrade!
#$wgLogo             = "$wgStylePath/common/images/wiki.png";

## UPO means: this is also a user preference option

$wgEnableEmail = true;
$wgEnableUserEmail = false; # UPO

$wgEmergencyContact = "apache@debsoc-mediawiki.herokuapp.com";
$wgPasswordSender = "apache@debsoc-mediawiki.herokuapp.com";

$wgEnotifUserTalk = false; # UPO
$wgEnotifWatchlist = false; # UPO
$wgEmailAuthentication = true;

## Database settings
if ($LOCAL_DEV) {
$wgDBtype = "sqlite";
$wgDBserver = "";
$wgDBname = "my_wiki";
$wgDBuser = "";
$wgDBpassword = "";

# SQLite-specific settings
$wgSQLiteDataDir = "/opt/lampp/data";
}
else {
$_wgDBConnectionString = getenv('DATABASE_URL');
if (preg_match('%(.*?)://([^:]+):([^@]+)@([^:]+):(\d+)/(.*)%', $_wgDBConnectionString, $regs, PREG_OFFSET_CAPTURE)) {
$wgDBtype = $regs[1][0];
$wgDBuser = $regs[2][0];
$wgDBpassword = $regs[3][0];
$wgDBserver = $regs[4][0];
$wgDBport = $regs[5][0];
$wgDBname = $regs[6][0];
$wgDBssl = true;
} else {
die("Failed to parse DB connection string: $_wgDBConnectionString");
}
}

# Postgres-specific settings
$wgDBmwschema = "mediawiki";

## Shared memory settings
# will figure this out with MemcacheSASL later
#$wgMainCacheType = CACHE_MEMCACHED;
#$wgMemCachedServers = array( 'mc1.dev.ec2.memcachier.com:11211' );

## To enable image uploads, make sure the 'images' directory
## is writable, then set this to true:
$wgEnableUploads = false;
$wgUseImageMagick = false;
$wgImageMagickConvertCommand = "/usr/bin/convert";

# InstantCommons allows wiki to use images from http://commons.wikimedia.org
$wgUseInstantCommons = false;

## If you use ImageMagick (or any other shell command) on a
## Linux server, this will need to be set to the name of an
## available UTF-8 locale
$wgShellLocale = "en_US.utf8";

## If you want to use image uploads under safe mode,
## create the directories images/archive, images/thumb and
## images/temp, and make them all writable. Then uncomment
## this, if it's not already uncommented:
#$wgHashedUploadDirectory = false;

## Set $wgCacheDirectory to a writable directory on the web server
## to make your wiki go slightly faster. The directory should not
## be publically accessible from the web.
#$wgCacheDirectory = "$IP/cache";

# Site language code, should be one of the list in ./languages/Names.php
$wgLanguageCode = "en";

$wgSecretKey = "be4a25f380f0277a08202c5c158d734fec00cf2e7e78d37dd1fbcb4414b268c0";

# Site upgrade key. Must be set to a string (default provided) to turn on the
# web installer while LocalSettings.php is in place
$wgUpgradeKey = "f30977b2abb6c40f";

## Default skin: you can change the default skin. Use the internal symbolic
## names, ie 'standard', 'nostalgia', 'cologneblue', 'monobook', 'vector':
#$wgDefaultSkin = "vector";

## For attaching licensing metadata to pages, and displaying an
## appropriate copyright notice / icon. GNU Free Documentation
## License and Creative Commons licenses are supported so far.
$wgRightsPage = ""; # Set to the title of a wiki page that describes your license/copyright
$wgRightsUrl = "";
$wgRightsText = "";
$wgRightsIcon = "";

# Path to the GNU diff3 utility. Used for conflict resolution.
$wgDiff3 = "/usr/bin/diff3";

# Query string length limit for ResourceLoader. You should only set this if
# your web server has a query string length limit (then set it to that limit),
# or if you have suhosin.get.max_value_length set in php.ini (then set it to
# that value)
$wgResourceLoaderMaxQueryLength = -1;


# End of automatically generated settings.
# Add more configuration options below.

# Use WikiEditor extension
#require_once( "$IP/extensions/WikiEditor/WikiEditor.php" );

#$wgDefaultUserOptions['wikieditor-preview'] = 1;
#$wgDefaultUserOptions['wikieditor-publish'] = 1;

# Use ckeditor
require_once("$IP/extensions/WYSIWYG/WYSIWYG.php");
$wgGroupPermissions['*']['wysiwyg']=true;

# Use sendgrid to send email
require_once 'Mail.php';

$wgSMTP = array(
	'host' => 'smtp.sendgrid.net',
	'username' => getenv("SENDGRID_USERNAME"),
	'password' => getenv("SENDGRID_PASSWORD"),
	'IDHost' => 'heroku.com',
	'port' => '587',
	'auth' => true
);

# Show the logo
$wgLogo = "{$wgStylePath}/common/images/debsoc.jpg";

# Don't allow users to change the skin
$wgHiddenPrefs[] = 'skin';

# Use strapping skin
require_once( "$IP/skins/strapping/strapping.php" );
$wgDefaultSkin = "strapping";

# Don't show TOC
$wgDefaultUserOptions['showtoc'] = 0;

# Need to be logged in to edit
$wgGroupPermissions['*']['edit']=false;

# Raw HTML upload
# Hope no one does something stupid with this
$wgRawHtml = true;


