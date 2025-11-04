$(function(){
  $('.btn-success').on('click', function(e){
    e.preventDefault();
    alert('Форма розміщення вакансії — тут має відкриватися модальне вікно або форма.');
  });
});

$(function(){
  $('.btn-success').on('click', function(e){
    e.preventDefault();
    alert('Форма розміщення вакансії — тут має відкриватися модальне вікно або форма.');
  });

  const step = 200; 
  const $wrapper = $('.logos-wrapper');
  let currentX = 0;

  $('.logos-next').on('click', function(e){
    e.preventDefault();
    const maxScroll = $wrapper[0].scrollWidth - $('.logos-view').width();
    currentX = Math.min(currentX + step, maxScroll);
    $wrapper.parent().animate({scrollLeft: currentX}, 250);
  });

  $('.logos-prev').on('click', function(e){
    e.preventDefault();
    currentX = Math.max(currentX - step, 0);
    $wrapper.parent().animate({scrollLeft: currentX}, 250);
  });


  $('#advancedFilterBtn').on('click', function(e){
    e.preventDefault();
    alert('Тут відкриється розширений фільтр (реалізуй в модальному вікні за потреби).');
  });
});

