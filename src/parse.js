/***************************************************************************************************************************************************************
 *
 * Parsing different languages
 *
 * ParseFM    - Parsing front matter out of a page if it exists
 * ParseMD    - Parsing markdown into HTML
 * ParseYaml  - Parsing yaml into an object
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import Marked from 'marked';
import React from 'react';
import YAML from 'yamljs';
import Path from 'path';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Helper
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
import { SETTINGS } from './settings.js';
import { Log, Style } from './helper';


/**
 * Parsing front matter out of a page if it exists
 *
 * @param  {string} content - The content of a partial with or without front matter
 *
 * @return {object}         - An object with parsed out front matter and it’s parsed yaml and the body. format: { frontmatter: {}, body: '' }
 */
export const ParseFM = ( content ) => {
	if( content.startsWith('---\n') ) {
		const bodyParts = content.split('---\n');

		return {
			frontmatter: ParseYaml( bodyParts[1] ),
			body: ParseMD( bodyParts.slice( 2 ).join('---\n') ),
		}
	}
	else {
		return {
			frontmatter: {},
			body: content,
		};
	}
}


/**
 * Parsing markdown into HTML using https://github.com/chjj/marked
 *
 * @param  {string} markdown - The markdown string
 *
 * @return {string}          - HTML rendered from the given markdown
 */
export const ParseMD = ( markdown ) => {
	let renderer = new Marked.Renderer();

	if( SETTINGS.get().site.markdownRenderer ) {
		const filePath = Path.normalize(`${ process.cwd() }/${ SETTINGS.get().site.markdownRenderer }`);

		try {
			renderer = require( filePath );
		}
		catch( error ) {
			Log.error(`Using the custom renderer for markdown caused an error at ${ Style.yellow( filePath ) }`);
			Log.error( error );

			if( process.env.NODE_ENV === 'production' ) { // let’s die in a fiery death if something goes wrong in production
				process.exit( 1 );
			}
		}
	}

	try {
		return Marked( markdown, { renderer: renderer } );
	}
	catch( error ) {
		Log.error(`Rendering markdown caused an error`);
		Log.error( error );

		if( process.env.NODE_ENV === 'production' ) { // let’s die in a fiery death if something goes wrong in production
			process.exit( 1 );
		}
	}
}


/**
 * Parsing yaml into an object using https://github.com/jeremyfa/yaml.js
 *
 * @param  {string} yaml - A yaml string
 *
 * @return {object}      - The parsed yaml
 */
export const ParseYaml = ( yaml ) => {
	try {
		return YAML.parse( yaml );
	}
	catch( error ) {
		Log.error(`Rendering yaml caused an error`);
		Log.error( error );

		if( process.env.NODE_ENV === 'production' ) { // let’s die in a fiery death if something goes wrong in production
			process.exit( 1 );
		}
	}
}
