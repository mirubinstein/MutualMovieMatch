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
	var resultHTML = "<button onclick='closeSearch()'>Close</button>";
	if (result[0] != "Nothing found.") {
		resultHTML += "<table width='95%' RULES=ROWS FRAME=HSIDES><tr>";
		for (var i = 0; i < result.length; i++) {
			var imageURL = "";
			if (result[i]["profile"].length > 0) {
				imageURL = result[i]["profile"][0]["image"]["url"];
			}
			resultHTML += "<tr>";
			resultHTML += "<td width='25%'><img src='"+imageURL+"'></td>";
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
	$("#searchResults").effect("slide",{ direction: "up" }, 250);
}

function closeSearch() {
	$("#searchResults").hide("slide", {direction: "up"},250);
}

function addPerson(id) {
	$("#actorList").hide("slide", {direction: "left"},250);
	$("#movieList").hide("slide", {direction: "right"},250);
	$("#searchResults").hide("slide", {direction: "up"},250, function() {
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
	updateMoveList();
	$('#spinner').hide();
}

function removePerson(id) {
	$("#actorList").hide("slide", {direction: "left"},250);
	$("#movieList").hide("slide", {direction: "right"},250, function() {
		delete people[id];
		updatePeopleList();
		updateMoveList();
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
		var listHTML = "Actor List";
		listHTML += "<table width='95%' RULES=ROWS FRAME=HSIDES><tr>";
		for (var id in people) {
			var imageURL = "";
			if (people[id]["profile"].length > 0) {
				imageURL = people[id]["profile"][1]["image"]["url"];
			}
			listHTML += "<tr>";
			listHTML += "<td width='30%'><img src='"+imageURL+"' width='100%'></td>";
			listHTML += "<td width='60%'>"+people[id]["name"]+"</td>";
			listHTML += "<td width='10%'><button onclick='removePerson(\""+id+"\")'>X</button></td>";
			listHTML += "</tr>";
		}
		$("#actorList").html(listHTML);
	} else {
		$("#actorList").html("");
	}
	$("#actorList").effect("slide",{ direction: "left" }, 250);
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

function updateMoveList() {
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
	
	if (movieList.length > 0) {
		var movieHTML = "Mutual Movies";
		movieHTML += "<table width='95%' RULES=ROWS FRAME=HSIDES><tr>";
		for (var mid in movieList) {
			movie = movieList[mid];
			movieHTML += "<tr>";
			imageURL = movie["poster"];
			movieHTML += "<td width='25%'><img src='"+imageURL+"' width='80%'></td>";
			
			movieHTML += "<td width='55%'><h3>"+movie["name"]+"</h3>";
			for (var id in people) {
				var person = "<b>"+people[id]["name"]+"</b>";
				var role = getJob(id,movie["id"]);
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
	} else {
		$("#movieList").html("");
	}
	$("#movieList").effect("slide",{ direction: "right" }, 250);
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

$.fx.speeds._default = 1000;
$(function() {
	$('#spinner').hide();
	
	$("#searchBox").keyup(function(event){
		if(event.keyCode == 13){
			search();
		}
	});
});