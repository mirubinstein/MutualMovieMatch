var apiKey = "6e22fe88c7f689ea8150cbf60a9617a6"
var people = new Array();
var movieList = new Array();

function search() {
	$('#spinner').show();
	var search = $("#searchBox").val();
	search = search.replace(/ /g,"+");
	searchPerson(search);
}

function searchPerson(name) {
	url = "http://api.themoviedb.org/2.1/Person.search/en/json/"+apiKey+"/"+name;
	$.ajax({
		url: url,
		dataType: 'jsonp',
		jsonpCallback:'searchPersonCallback'
	});
}

function searchPersonCallback(result) {
	var headerHTML = "<button onclick='closeSearch()'>Close</button>";
	$("#searchHeader").html(headerHTML);
	var resultHTML = "";
	if (result[0] != "Nothing found.") {
		resultHTML += "<table width='95%' RULES=ROWS FRAME=HSIDES><tr>";
		for (var i = 0; i < result.length; i++) {
			var imageURL = "";
			resultHTML += "<tr>";
			resultHTML += "<td width='25%'>";
			if (result[i]["profile"].length > 0) {
				imageURL = result[i]["profile"][0]["image"]["url"];
				resultHTML += "<img src='"+imageURL+"'>";
			}
			resultHTML != "</td>";
			resultHTML += "<td width='65%'>"+result[i]["name"]+"</td>";
			resultHTML += "<td width='10%'><button onclick=addPerson("+result[i]["id"]+")>Add</button>";
			resultHTML += "</tr>";
		}
		
		$("#searchBox").val("");
	} else {
		var search = $("#searchBox").val();
		resultHTML += "<BR>No results for " + search;
	}
	$("#searchResults").html(resultHTML);
	$('#spinner').hide();
	$("#searchWrapper").effect("slide",{ direction: "up" }, 250);
	$("#mask").effect("fade", 250);
	$("body").css("overflow","hidden");
}

function closeSearch() {
	$("#searchWrapper").hide("slide", {direction: "up"},250);
	$("#mask").hide("fade",250);
	$("body").css("overflow","auto");
}

function addPerson(id) {
	closeSearch();
	$("#actorList").hide("slide", {direction: "left"},250);
	$("#movieList").hide("slide", {direction: "right"},250,function() {
		$('#spinner').show();
		url = "http://api.themoviedb.org/2.1/Person.getInfo/en/json/"+apiKey+"/"+id;
		$.ajax({
			url: url,
			dataType: 'jsonp',
			jsonpCallback:'addPersonCallback'
		});
	});
}

function addPersonCallback(result) {
	var id = result[0]["name"]+result[0]["id"];
	people[id] = result[0];
	updatePeopleList();
	updateMovieList();
	$('#spinner').hide();
}

function removePerson(id) {
	$("#actorList").hide("slide", {direction: "left"},250);
	$("#movieList").hide("slide", {direction: "right"},250, function() {
		delete people[id];
		updatePeopleList();
		updateMovieList();
	});
}

function numPeople() {
	var size = 0, key;
    for (key in people) {
        if (people.hasOwnProperty(key)) size++;
    }
    return size;
}

function updatePeopleList() {
	if (numPeople() > 0) {
		var listHTML = "<b>Actor List</b>";
		listHTML += "<table width='95%' RULES=ROWS FRAME=HSIDES><tr>";
		for (var id in people) {
			var imageURL = "";
			listHTML += "<tr>";
			listHTML += "<td width='30%'>";
			if (people[id]["profile"].length > 0) {
				imageURL = people[id]["profile"][1]["image"]["url"];
				listHTML += "<img src='"+imageURL+"' width='100%'>";
			}			
			listHTML += "</td>";
			listHTML += "<td width='60%'><a href='#' onclick='morePersonInfo(\""+id+"\")'><b>"+people[id]["name"]+"</b></a><BR>";
			if ("birthday" in people[id] && people[id]["birthday"] != null && people[id]["birthday"] != "") {
				listHTML += "Born " + people[id]["birthday"] + "<BR>";
			}
			
			if ("birthplace" in people[id] && people[id]["birthplace"] != null && people[id]["birthplace"] != "") {
				listHTML += "in " + people[id]["birthplace"] + "</td>";
			}
			
			listHTML += "<td width='10%'><button onclick='removePerson(\""+id+"\")'>X</button></td>";
			listHTML += "</tr>";
		}
		$("#actorList").html(listHTML);
		$("#actorList").effect("slide",{ direction: "left" }, 250);
	} else {
		$("#actorList").html("");
	}
}

function getJob(person,movie) {
	var films = people[person]["filmography"];
	var jobs = "";
	for (var i = 0; i < films.length; i++) {
		if (films[i]["id"] == movie){
			var job = films[i]["job"];
			if (job == "Actor") {
				jobs += films[i]["character"] + ", ";
			} else {
				jobs += films[i]["job"] + ", ";
			}
		}
	}
	return jobs.slice(0,-2);
	
}

function updateMovieList() {
	movieList.length = 0;
	var firstID = true;
	for (var id in people) {
		if (firstID) {
			firstList = people[id]["filmography"];
			for (var mid in firstList) {
				movie = firstList[mid];
				movieList[movie["id"]] = movie;
			}
			firstID = false;
		} else {
			var list = people[id]["filmography"];
			var tempMovieList = new Array();
			for (var mid in list) {
				movie = list[mid];
				movieID = movie["id"];
				
				if (movieID in movieList) {
					tempMovieList[movieID] = movie;
				}
			}
			movieList = tempMovieList;
		}
	}
	
	//Sort movieList
	movieList.sort(movieSorter);
	
	var movieHTML = "<b>Mutual Movies</b>";
	if (movieList.length > 0) {
		movieHTML += "<table width='95%' RULES=ROWS FRAME=HSIDES><tr>";
		for (var mid in movieList) {
			movie = movieList[mid];
			movieHTML += "<tr><td width='25%'>";
			if (movie["poster"] != "") {
				imageURL = movie["poster"];
				movieHTML += "<img src='"+imageURL+"' width='80%'>";
			} 
			movieHTML += "</td>";
			movieHTML += "<td width='55%'><h3>"+movie["name"]+"</h3>";
			for (var id in people) {
				var person = "<b>"+people[id]["name"]+"</b>";
				var role = getJob(id,movie["id"]);
				if (role == "null" || role == "") {
					role = "Unnamed"
				}
				movieHTML += person+" - "+role+"<BR>";
			}
			movieHTML += "</td>";
			
			releaseDate = movie["release"];
			if (releaseDate == null) {
				movieHTML += "<td width='20%'>TBD</td>";
			} else {
				movieHTML += "<td>"+releaseDate+"</td>";
			}
			movieHTML += "</tr>";
			
		}
		$("#movieList").html(movieHTML);
		$("#movieList").effect("slide",{ direction: "right" }, 250);
	} else if (numPeople() > 0) {
		movieHTML += "<table width='95%' RULES=ROWS FRAME=HSIDES><tr><td align='center'>";
		movieHTML += "These people have not been in a movie together!</td></tr></table>"
		$("#movieList").html(movieHTML);
		$("#movieList").effect("slide",{ direction: "right" }, 250);
	} else {
		$("#movieList").html("");
	}
}

function movieSorter(a,b) {
	var aDateString = a["release"];
	var bDateString = b["release"];
	if (aDateString == null) {
		return -1;
	}else if (bDateString == null) {
		return 1;
	} else {
		aDate = new Date(aDateString);
		bDate = new Date(bDateString);
		if (aDate > bDate) {
			return -1;
		} else {
			return 1;
		}
	}
}

function morePersonInfo(id) {
	var name = people[id]["name"];
	var infoHeaderHTML = "<button onclick='closeInfo()'>Close</button>";
	infoHeaderHTML += "<h1>"+name+"</h1>";
	$("#infoHeader").html(infoHeaderHTML);
	
	var imageURL = people[id]["profile"][2]["image"]["url"];
	var infoLeftHTML = "<img src='"+imageURL+"' width='200px'><BR><BR>";
	
	if (people[id]["birthday"].length > 0) {
		var birthday = people[id]["birthday"];
		infoLeftHTML += "<B>Born</B><BR>"+birthday+"<BR><BR>";
	}
	if (people[id]["birthplace"].length > 0) {
		var birthplace = people[id]["birthplace"];
		infoLeftHTML += "<B>in</B><BR>"+birthplace+"<BR><BR>";
	}
	if (people[id]["known_as"].length > 0) {
		var knownAs = people[id]["known_as"];
		infoLeftHTML += "<B>Known As:</B><BR>";

		for (var n = 0; n < knownAs.length ; n++) {
			infoLeftHTML += knownAs[n]["name"]+"<BR>";
		}
	}		
	$("#infoLeft").html(infoLeftHTML);
	
	var infoRightHTML = "<b>Biography</b><BR>";
	if (people[id]["biography"].length > 0) {
		var bio = people[id]["biography"];
		infoRightHTML += bio;
	}
	$("#infoRight").html(infoRightHTML);
	$("#infoWrapper").effect("slide",{ direction: "down" }, 250);
	$("#mask").effect("fade", 250);
	$("body").css("overflow","hidden");
}

function closeInfo() {
	$("#infoWrapper").hide("slide", {direction: "down"},250);
	$("#mask").hide("fade", 250);
	$("body").css("overflow","auto");
}

$.fx.speeds._default = 500;
$(function() {
	$('#spinner').hide();
	
	$("#searchBox").keyup(function(event){
		if(event.keyCode == 13){
			search();
		}
	});
});