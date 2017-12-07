/*
 *	Kartkomponent for visning av Google Maps
 *	01.12.2017: Per Olav Mariussen
 *
 *  Props:
 *		kart: {
 *			pos: {lat:float, lng:float},	
 *			zoom: number,
 *			text: string 		// Hvis text ikke er tom, vises denne på pos i kartet
  *		}
 */
 
import React from 'react';
import { compose, withStateHandlers } from "recompose";
import { withScriptjs, withGoogleMap, GoogleMap, Marker, InfoWindow } from "react-google-maps";

import webpero from './webpero.js';

/* Komponent for visning av sted på kartet */
class Kart extends React.PureComponent
{		
	render() {
		/* 
			Komponent for Google Maps: react-google-maps
			https://tomchentw.github.io/react-google-maps
		*/
		const MyMap = 
			compose(
				withStateHandlers(() => 
					({
						isOpen: false
					}), 
					{
						onToggleOpen: ({ isOpen }) => () => ({
							isOpen: !isOpen
					})
				}),
				withScriptjs,
				withGoogleMap
			)((props) => 
				<GoogleMap zoom={props.zoom} ref={(map) => map && map.panTo(props.center)} >
					{props.showMarker && 
						<Marker position={props.center} onClick={props.onToggleOpen} >
							{props.isOpen && <InfoWindow onCloseClick={props.onToggleOpen} >
									<div>
										{props.text}
									</div>
								</InfoWindow>
							}
						</Marker>
					}
				</GoogleMap>
			);

		return (
			<MyMap
				googleMapURL = 		{"https://maps.googleapis.com/maps/api/js?key=" + webpero.googleKey() + "&v=3.exp&libraries=geometry"}
				loadingElement = 	{<div style={{ height: `100%` }} />}
				containerElement = 	{<div style={{ height: `400px`, width: `468px` }} />}
				mapElement =		{<div style={{ height: `100%` }} />}
				showMarker = 		{this.props.text !== ""}
				zoom = 				{this.props.zoom}
				center = 			{this.props.pos}
				text = 				{this.props.text}
			/>
		);
	}
}

export default Kart;