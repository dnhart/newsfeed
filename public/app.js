// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
      console.log(data);
    // Display the apropos information on the page
    $("#articles").append("<p><a href='" + data[i].link + "'>"+data[i].title+"</a><br /><button type='button' class='btn btn-primary btn-xs note' data-id='" + data[i]._id+"'>Comments</button></p><br />");
  }
});

// Whenever someone clicks a comment button
$(document).on("click", ".note", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the comment button
  var thisId = $(this).attr("data-id");
//   console.log(thisId);

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' placeholder='Your Name' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' placeholder='Comment' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      $("#notes").append("<div id='prevNotes'><h3>Previous Comments</h3></div>");
      // If there's a note in the article
      if (data.note) {

          for(var i=0;i<data.note.length;i++){
              var note = data.note[i];
          $("#prevNotes").append("<div><strong>"+note.title+":</strong><em>"+" "+note.body+"</em></p>")
          }
        // // Place the title of the note in the title input
        // $("#titleinput").val(data.note.title);
        // // Place the body of the note in the body textarea
        // $("#bodyinput").val(data.note.body);
      }
    });
});


// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");
console.log(thisId);
var newTitle = $("#titleinput").val();
var newBody =$("#bodyinput").val();
console.log(newTitle);
  // Run a POST request to change the note, using what's entered in the inputs
if(newTitle && newBody){
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data.note);

      // Empty the notes section
     $("#prevNotes").append("<div><strong>"+newTitle+":</strong><em>"+" "+newBody+"</em></div>")
          
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
} else {
    alert("Please enter your name or comment.");
};
});
