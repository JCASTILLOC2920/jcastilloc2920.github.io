document.addEventListener("DOMContentLoaded", function() {
    var expandableButtons = document.querySelectorAll(".expandable-button");

    expandableButtons.forEach(function(button) {
        button.addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    });
});
