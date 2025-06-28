// YouTube/AI task recommender logic
// Suggest YouTube videos based on task text
function suggestResources(taskText) {
  const keywords = encodeURIComponent(taskText);
  const url = `https://www.youtube.com/results?search_query=${keywords}+study`;

  const suggestion = document.createElement("a");
  suggestion.href = url;
  suggestion.target = "_blank";
  suggestion.textContent = "📹 Suggested: " + taskText;

  const lastTask = document.querySelector("#todo-list li:last-child");
  if (lastTask) lastTask.appendChild(suggestion);
}
