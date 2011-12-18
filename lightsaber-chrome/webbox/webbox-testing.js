define(
    ['/webbox/webbox-ns.js', '/webbox/webbox-model.js', '/webbox/util.js', '/webbox/webbox-config.js', '/webbox/webbox-kb.js'],
    
    function(ns,m,util,config, wkb) {
	var t1 = function() {
	    var f = new m.Model({},"http://unit.tests.com/t1");
	    var f2 = new m.Model({},"http://unit.tests.com/t2");
	    var d = new $.Deferred();
	    var age = Math.round(100*Math.random());
	    var name = "test1-"+util.guid(10);
	    f.set({name:name, age:age,lover:f2});
	    f.save().then(
		function() {
		    var g = new m.Model({},"http://unit.tests.com/t1");
		    g.fetch().then(function(x) {
				       console.assert(g.get("name") == name, "name !== ", name, g.get("name"));
				       console.assert(g.get("age") == age, "age !==  ", age, g.get("name"));
				       console.assert(g.get("lover")  && g.get("lover").uri == "http://unit.tests.com/t2", " lover ", g.get("lover"));
				       d.resolve();
				   });
		});
	    return d.promise();	    
	};
	var tests = [t1]; // add unit tests here

	var make_people = function() {
	    var make_person = function() {
		var first_name = util.randomlyPick(['Cat', 'Nichola', 'Nigel', 'Jack', 'Peter','Susan', 'monica', 'Daniel', 'Yang', 'Nick', 'Hugh', 'Ian', 'Tim', 'Wendy', 'Antonio', 'Igor']);
		console.log("first_name", first_name);
		var last_name = util.randomlyPick(['Shadbolt', 'Smith', 'Need', 'Electron', 'Yang', 'Gibbins', 'Berners-Lee', 'Hall', 'Penta', 'schraefel', 'West', 'Saunders', 'Popov']);
		var uri = ns.expand('enakting_people:'+first_name+"_"+last_name);
		var options =
		    {
			first_name:first_name,
			last_name:last_name
		    };
		options[ns.expand('rdf:type')] = ns.expand('webbox:Person');
		options[ns.expand('rdfs:label')] = first_name + " " + last_name;
		var bm = new m.Model(options,uri);
		return bm;
	    };
	    console.log("foo");
	    var objs = {};
	    util.intRange(0,25).map(
		function() {
		    var u = make_person();
		    console.log("PERSON >>> ", u.url(), u, u.toJSON() );		    
		    objs[u.url()] = u;
		    console.log(u.url(), u);
		    u.save();
		});

	    var persons = new m.Model({},ns.expand('webbox:Person'));
	    var options = {};
	    options[ns.expand('rdfs:label')] = 'Person(s)';
	    persons.set(options);
	    persons.save();
	    
	    return objs;
	};

	var make_places = function() {
	    var places = ["Building 32","Robot fortress", "Hartley Library", "The Stag\'s", "SUSU Cafe", "Student Union", "Arlott Bar (Staff Club)", "Staff Club", "Trago Lounge" ];
	    var cs = places.map(function(place) {
			   var uri = ns.expand("enakting:"+place.replace(/ /g,'_').toLowerCase());
			   var options = {};
			   options[ns.expand('rdfs:label')] = place;
			   options[ns.expand('rdf:type')] = ns.expand('webbox:Place');
			   var mn = new m.Model(options,uri);
			   mn.save();
			   return mn;
		       });
	    var place = new m.Model({},ns.expand('webbox:Place'));
	    var options = {};
	    options[ns.expand('rdfs:label')] = 'Places';
	    place.set(options);
	    place.save();
	    return cs;
	};

	var make_bookmarks = function() {
	    
	    var mk_bkmk = function(name,url) {
		var bkmk = new m.Model({}, ns.expand(url.replace(/ /g,'_').toLowerCase()));
		// omit type
		bkmk.set2("rdfs:label", name);
		bkmk.set2("webbox:href", url);
		return bkmk;
	    };

	    var mk_bkmks = function(kv, typeuri, typelabel) {
		var typeclass = new m.Model({}, ns.expand(typeuri));
		typeclass.set2("rdfs:label", typelabel);
		typeclass.save();
		return _(kv).keys().map(
		    function(k) {
			var m = mk_bkmk(k,kv[k]);
			m.set2("rdf:type", typeclass);
			m.save();
			return m;
		    });
	    };

	    mk_bkmks({
			 "Google Public Data": 'http://www.google.com/publicdata/home',
			 "Data.gov.uk": "http://www.data.gov.uk",
			 "OS OpenData": "http://www.ordnancesurvey.co.uk/oswebsite/opendata/",
			 "London datastore": "http://data.london.gov.uk/",
			 "Dbpedia": "http://dbpedia.org"
		     },
		     ns.expand("webbox:OpenDataBookmarks"),
		     "Open Data Resources");	    

	    mk_bkmks({
			 'Backbone.js' : 'http://documentcloud.github.com/backbone/',
			 'Underscore.js' : 'http://documentcloud.github.com/backbone/',
			 'Less.js' : 'http://lesscss.org/',
			 'Require.js' : 'http://requirejs.org/',
			 'jQuery' : 'http://jquery.org/',
			 'NodeJS' : 'http://nodejs.org/'
		     },
		     ns.expand("webbox:JavascriptBookmarks"),
		     "Javascript Resources");	  	    

	};	
	
	return {
	    run: function() {
		util.intRange(tests.length).map(
		    function(i) {
			console.log(i);
			console.group();
			console.log("Test ", i);
			tests[i]().then(function() { console.log("if no errors, passed T1"); });	
		    });
	    },
	    get_graphs:wkb.get_graphs,
	    make_people:make_people,
	    make_places:make_places,
	    make_bookmarks:make_bookmarks    
	};	
    });