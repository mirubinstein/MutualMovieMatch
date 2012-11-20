var apiKey = "6e22fe88c7f689ea8150cbf60a9617a6"
var people = new Array();
var movieList = new Array();

function search() {
	var search = document.getElementById('searchBox').value;
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
	var resultHTML = "<table border='1'><tr>";
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
}

function addPerson(id) {
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
}

function updatePeopleList() {
	var listHTML = "<table border='1'><tr>";
	for (var id in people) {
		var imageURL = "";
		if (people[id]["profile"].length > 0) {
			imageURL = people[id]["profile"][0]["image"]["url"];
		}
		listHTML += "<tr>";
		listHTML += "<td><img src='"+imageURL+"'></td>";
		listHTML += "<td>"+people[id]["name"]+"</td>";
		listHTML += "</tr>";
	}
	$("#actorList").html(listHTML);
}

function updateMoveList() {
	movieList.length = 0;
	var firstID = 0;
	if (people.length > 0) {
		for (var id in people) {
			firstID = id;
			break
		}
		//movieList = $.extend(true,[],people[id]["filmography"]);
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
				alert(movieID);
				
				if (movieID in movieList) {
					tempMovieList[movieID] = movie;
				}
			}
			movieList = tempMovieList;
			/*
			for (var mid in movieList) {
				if (!mid in movies) {
					movieList.splice(mid,1);
				}
			}
			*/
		}
	}
	
	
	var movieHTML = "<table border='1'><tr>";
	for (var mid in movieList) {
		movieHTML += "<tr>";
		movieHTML += "<td>"+movieList[mid]["name"]+"</td>";
		movieHTML += "</tr>";
		
	}
	$("#movieList").html(movieHTML);
}