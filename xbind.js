/**********************************************
XHTML binding language. 
Copyright (C) 2012 Alexander Forselius

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var xbind_ns = "http://segurify/";
var xbinder = new XBind();
function xbind() {
	this.binder = new XBind();
	this.binder.refresh();
}
exports.xbind = xbind;
/***
XBind main class
*/
function XBind() {
	this.bindings = {}
	this.init = function() {
		/*
		Get all links
		and parse them
		*/
		var links = document.getElementsByTagName("link");
		for(var i = 0; i < links.length; i++) {
			var link = links[i];
			if(link.getAttribute("rel") == "binding") {
				if(link.getAttribute("type") == "application/xml") {
					var href = link.getAttribute("href"); // Get HREF
					var id = link.getAttribute("id");
					bindings[id] = href;
					
				}
			}
		}
	};
	/***
	Bind all elements
	*/
	this.refresh = function() {
		var elements = document.body.getElementsByTagName("*");
		for(var i = 0; i < elements.length; i++) {
			
			var element = elements[i];
			console.log(element);
			if(element.hasAttribute("binding")) {
				console.log("A");
				// Bind element
				var xbind = element.getAttribute("binding");
				var id = xbind.replace("xbind://", "").split("/")[0];
				console.log(id);
				this.startBind(element, id);
			}
		}
	}
	/***
	Bind a XML file
	***/
	this.startBind = function(element, id) {
		var xmlHttp = new XMLHttpRequest();
		var bind = this.bind;
		console.log(element);
		xmlHttp.onreadystatechange = function() {
			if(xmlHttp.readyState == 4 ) {
				if ( xmlHttp.status == 200) {
					var xml = xmlHttp.responseXML; // ResponseXML
					console.log(xml);
					bind(element, xml);
					// Append loading system
			
				} else if(xmlHttp.status == 503) {
					console.log(xmlHttp.status);
					var loading = document.getElementById(element.getAttribute("template")).getElementsByTagName("error")[0];
					element.innerHTML = loading.innerHTML;

				}
			}
		};
		// C 
		var link = document.getElementById(id);
		var path = link.getAttribute("href");
		
		// Append loading system
		
		var loading = document.getElementById(element.getAttribute("template")).getElementsByTagName("loading")[0];
	//	alert(loading.innerHTML);
		element.innerHTML = loading.innerHTML;
		xmlHttp.open("GET", path, true);
		console.log(path);
		xmlHttp.send(null);
	};
	this.startTag = "{{";
	this.endTag = "}}";
	/****
	@description
	Binds an element with the data source
	@author Alexander
	@param element The element to render the binding on
	@param xml The responseXML to bind to
	*/
	this.bind = function(element, xml) {
		var startTag = "{{";
		var endTag = "}}";
			var binding_uri = element.getAttribute("binding");
	//		alert(xml);
			// Parse the uri token and replicate it
			if(binding_uri.indexOf("xbind://") != 0) {
				throw "Only XBIND protocol is supported for now";
			}
			
			// Otherwise try
			var XPath = binding_uri.replace("xbind:","");
			
			// Get the id of the link that are responsible for the content binding
		//	XPath = "//"+XPath.split("/", 2)[1];
			//alert(XPath);
			
			var nodes = document.evaluate( XPath, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
			console.log(XPath);
	//		alert("A");
		//	alert(nodes);
			console.log(nodes);
			var innerContent = ""; // Inner content
			var template = document.getElementById(element.getAttribute("template"));
			
			var repeaterContent = template.getElementsByTagName("serie")[0];
			console.log(repeaterContent);
			console.log(nodes.snapshotLength);
	
			/*
			Repeat through the collection and serialize the object
			*/
			for (var l = 0; l < nodes.snapshotLength; l++){
				console.log(l);
				
				var html = repeaterContent.innerHTML; // Get innerHTML
				var item = nodes.snapshotItem(l);
				var c_index = 0; // Current index
				// Get all {{ }}
				console.log("C");
				while(c_index < html.length) {
					console.log(html);
					console.log(startTag);
					c_index = html.indexOf(startTag )  ;
					console.log(c_index);
					if(c_index == -1)
						break;
					else
						c_index += startTag.length;
					var ending = html.indexOf(endTag, c_index);
					console.log(ending);
					if(ending == -1){
						throw "No end tag supplied to starting tag at "+ c_index;
					}

					var str = html.substring(c_index, ending);
					console.log(str);
					var str2 = str;
					c_index = ending;
						// Get the inner string
						
						/*
					Now parse the XQuery and replicate it
					*/
					try{
						console.log( XPath + "[" + l + "]/");
						console.log(str2);
						if(str2.indexOf("@") == 0) {
							html = html.replace(startTag + str + endTag, item1.getAttribute(str2.replace("@","")));
						} else {
							var expression = XPath + "[" + (l+1) + "]" + (str2 != "" ? "/" + str2  : "");
							console.log(expression);
							var query = document.evaluate( expression, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
						
							var item1 = query.snapshotItem(0);
							console.log(item1);
							console.log(startTag + str + endTag);
							html = html.replace(startTag + str + endTag, item1.textContent	);
							console.log(html);
						}
					}catch(e) {
						throw e;
						break;
					}
					c_index = ending;
				
					
				}
				innerContent += html; // Append the item to the list
			
				// Parse the underlying element
			}	
			element.innerHTML = innerContent;
		
	}
}