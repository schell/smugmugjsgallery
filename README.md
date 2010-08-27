Smug Mug JS Gallery v0.0.2
==========================
This is a gallery viewer for smug mug galleries, written in javascript + mootools.

Use
---
Step 1: Include the monolithic js file, smugal/smugal-monolithic.js (this file is a concatenation of all the libs and smugal.js - for convenience), or optionally, include all the libs and smugal/smugal.js in your html.  
	<!-- option 1 -->
	<script src="smugal/smugal-monolithic.js" type="text/javascript" charset="utf-8"></script>
	<!-- or option 2 -->
	<script src="smugal/mootools-1.2.4-core.js" type="text/javascript" charset="utf-8"></script>
	<script src="modules/go/go.js" type="text/javascript" charset="utf-8"></script>
	<script src="modules/heyjacks/heyjacks.js" type="text/javascript" charset="utf-8"></script>
	<script src="smugal/smugal.js" type="text/javascript" charset="utf-8"></script>
	
Step 2: Create a div in the body of your html to hold the gallery - the inner html of this div will be rewritten once the gallery is loaded successfully, which is great for alt content (in case the user has js turned off, or the api calls fail).
	<body>
		<div id="theGalleryDivId">Here is a smug mug gallery!</div>
	</body>
	
Step 2: Initialize smugal with your configuration options (description of options below).
	<script type="text/javascript" charset="utf-8">
		smugal({
			targetId : 'theGalleryDivId',
			albumId : '11397881',
			albumKey : 'MYoeS',
			fadeDuration : 1000
		});
	</script>
	

Config options
--------------
The configuration options are listed below with their name, type and a description. All options are required EXCEPT targetId, albumId and albumKey. Image size is 'Original' by default.

	testing - boolean (true or false) - if true, debugging messages will be output to the js console (don't use this if your browser doesn't have a js console)
	targetId - string ('somestring') - the id of the div the gallery should be injected into (required)
	albumId - string - the album id of the album being shown 
	albumKey - string - the album key of the album being shown
	
		A note about album id and key - they can be retreived from your gallery url. They are connected by an underscore '_' as it is in any SmugMug gallery url like in this example:
		http://cmac.smugmug.com/gallery/2504559_f3ta9
		2504559 is the albumId
		f3ta9 is the albumKey (the key is case sensitive and you will encounter upper case characters in it)
		
	size - string - the image size the gallery should display. If the preferred size is not available the gallery will display the original size by default.
	
		A note about sizes - the size must be one of the following:
			'X3Large'
			'X2Large'
			'XLarge'
			'Large'
			'Lightbox'
			'Medium'
			'Original'
			'Small'
			'Thumb'
			'Tiny'
			
	viewDuration - number - the length of time (in milliseconds) that each picture is shown at full opacity
	fadeDuration - number - the length of time (in milliseconds) that each picture takes to fade in or out
