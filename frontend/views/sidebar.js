$(document).ready(function(){
    $('.nav-link').click(function(e){
        e.preventDefault(); // Prevent the default action of the link
        $(this).siblings('.submenu').toggleClass('active-submenu');
    });
});
$(document).ready(function() {
    $('#menu-toggle').click(function() {
        $('.sidebar').toggleClass('sidebar-active');
    });
});