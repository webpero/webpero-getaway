/*
 *	Komponent for visning av vær fra yr.no 
 *	01.12.2017: Per Olav Mariussen
 *
 *	Props:
 *		vaer: {
 *			url: string
 *		}
 */
 
import React from 'react';

function Vaer( props )
{
	if ( props.url !== undefined && props.url.length > 2 ) {
		return( 
			<iframe id="yr" title="yr" src={props.url+'ekstern_boks_tre_dager.html'} width="468" height="290" frameBorder="0" scrolling="no"></iframe>
		);
	} else {
		return(
			<p></p>
		);
	}
}

export default Vaer;