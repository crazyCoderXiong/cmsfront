function errorTip(tip) {
	$('#errorTip,#shade').show();
	$('#errorTip .content').text(tip);
}
$('#errorTip span').click(function() {
	$(this).parent().hide();
	$('#shade').hide();
	return false;
})
/*$(document).click(function(){
	$('#errorTip,#shade').hide();
})*/
