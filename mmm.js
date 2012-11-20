var apiKey = "6e22fe88c7f689ea8150cbf60a9617a6"
var people = new Array();
var movieList = new Array();

function search() {
	$('#spinner').show();
	var search = $("#searchBox").val();
	$("#searchBox").val("");
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
	var resultHTML = "<table border='1' width='100%'><tr>";
	for (var i = 0; i < result.length; i++) {
		var imageURL = "";
		if (result[i]["profile"].length > 0) {
			imageURL = result[i]["profile"][0]["image"]["url"];
		}
		resultHTML += "<tr>";
		resultHTML += "<td><img src='"+imageURL+"'></td>";
		resultHTML += "<td>"+result[i]["name"]+"</td>";
		resultHTML += "<td><button onclick=addPerson("+result[i]["id"]+")>Add</button>";
		resultHTML += "</tr>";
	}
	$("#searchResults").html(resultHTML);
	$('#spinner').hide();
	$("#searchResults").dialog( "open" );
}

function addPerson(id) {
	$('#spinner').show();
	$("#searchResults").dialog( "close" );
	$("#searchResults").html("");
	
	url = "http://api.themoviedb.org/2.1/Person.getInfo/en/json/"+apiKey+"/"+id;
	$.ajax({
		url: url,
		dataType: 'jsonp',
		jsonpCallback:'addPersonCallback'
	});
}

function addPersonCallback(result) {
	people[result[0]["id"]] = result[0];
	updatePeopleList();
	updateMoveList();
	$('#spinner').hide();
}

function removePerson(id) {
	delete people[id];
	updatePeopleList();
	updateMoveList();
}

function updatePeopleList() {
	if (people.length > 0) {
		var listHTML = "<table border='1'><tr>";
		for (var id in people) {
			var imageURL = "";
			if (people[id]["profile"].length > 0) {
				imageURL = people[id]["profile"][0]["image"]["url"];
			}
			listHTML += "<tr>";
			listHTML += "<td><img src='"+imageURL+"'></td>";
			listHTML += "<td>"+people[id]["name"]+"</td>";
			listHTML += "<td><button onclick='removePerson("+id+")'>Remove</button></td>";
			listHTML += "</tr>";
		}
		$("#actorList").html(listHTML);
	} else {
		$("#actorList").html("");
	}
}

function updateMoveList() {
	movieList.length = 0;
	var firstID = 0;
	if (people.length > 0) {
		for (var id in people) {
			firstID = id;
			break
		}
	}
	for (var id in people) {
		if (id == firstID) {
			firstList = people[id]["filmography"];
			for (var mid in firstList) {
				movie = firstList[mid];
				movieList[movie["id"]] = movie;
			}
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
		var movieHTML = "<table border='1'><tr>";
		for (var mid in movieList) {
			movie = movieList[mid];
			movieHTML += "<tr>";
			imageURL = movie["poster"];
			movieHTML += "<td><img src='"+imageURL+"'></td>";
			movieHTML += "<td>"+movie["name"]+"</td>";
			releaseDate = movie["release"];
			if (releaseDate == null) {
				movieHTML += "<td>TBD</td>";
			} else {
				movieHTML += "<td>"+releaseDate+"</td>";
			}
			movieHTML += "</tr>";
			
		}
		$("#movieList").html(movieHTML);
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

$.fx.speeds._default = 1000;
$(function() {
	$( "#searchResults" ).dialog({
		autoOpen: false,
		show: "blind",
		hide: "explode",
		width: 400,
		maxHeight: 400
	});
	
	$('#spinner').hide();
});