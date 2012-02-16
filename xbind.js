/**********************************************
XHTML binding language. 
(
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
			
				} else {
					var loading = document.getElementById(element.getAttribute("template")).getElementsByTagNameNS(xbind_ns, "error");
					element.innerHTML = loading.innerHTML;

				}
			}
		};
		// C 
		var link = document.getElementById(id);
		var path = link.getAttribute("href");
		
		// Append loading system
		alert(element.getAttribute("template"));
		var loading = document.getElementById(element.getAttribute("template")).getElementsByTagNameNS(xbind_ns, "loading");
		element.innerHTML = loading.innerHTML;
		xmlHttp.open("GET", path, true);
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
		try {
			var binding_uri = element.getAttribute("binding");
			alert(xml);
			// Parse the uri token and replicate it
			if(binding_uri.indexOf("xbind://") != 0) {
				throw "Only XBIND protocol is supported for now";
			}
			
			// Otherwise try
			var XPath = binding_uri.replace("xbind://","");
			
			// Get the id of the link that are responsible for the content binding
			XPath = "//"+XPath.split("/", 2)[1];
			//alert(XPath);
			
			var nodes = document.evaluate( XPath, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
			alert("A");
			alert(nodes);
			console.log(nodes);
			var innerContent = ""; // Inner content
			var template = document.getElementById(element.getAttribute("template"));
			var repeaterContent = template.getElementsByTagNameNS(xbind_ns, "serie");
			alert(repeaterContent.length);
			console.log(template);
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
					c_index = html.indexOf(this.startTag + 2);
					var ending = html.indexOf(c_index, this.endTag);
					var str = html.indexOf(c_index, this.endTag - c_index);
					var str2 = str.trim(' ');
						// Get the inner string
						
					/*
					Now parse the XQuery and replicate it
					*/
					var query = document.evaluate( XPath + "[" + l + "]/" + str2, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
					var item1 = query.snapshotItem(l);
					html = html.replace(this.startTag + str + this.endTag, item1.nodeValue);
				}
				innerContent += html; // Append the item to the list
			
				// Parse the underlying element
			}	
			element.innerHTML = innerContent;
		} catch(e) {
			throw e.message;
		}
	}
}