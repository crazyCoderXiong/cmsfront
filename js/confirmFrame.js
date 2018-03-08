function confirmFrame (text, sureFunc, nosureFunc) {
	$('.confirmFrame .content').text(text)
	$('.confirmFrame').show()
	$('.confirmMask').show()
	if (typeof(sureFunc) == 'function') {
		$('.confirmFrame .sure').click(sureFunc)
		$('.confirmFrame .sure').click(close)
	} else {
		$('.confirmFrame .sure').click(close)
	}
	if (typeof(nosureFunc) == 'function') {
		$('.confirmFrame .no-sure').click(nosureFunc)
		$('.confirmFrame .no-sure').click(close)
	} else {
		$('.confirmFrame .no-sure').click(close)
	}
}
function close () {
	$('.confirmFrame').hide()
	$('.confirmMask').hide()
	// 解除元素上绑定的点击事件 防止多次绑定重复触发
	$('.confirmFrame .sure').off('click')
	$('.confirmFrame .no-sure').off('click')
}
$('.confirmFrame .cancel span').click(close)

