const switch_to_night_mode = () => {
  document.querySelector("#whether_nightmode").innerHTML = `
          body{
            background-color:#000000c7;
            
          }
          #blog_index_title,#blog_index_subtitle, .article-content h2,.page-content h2, #article-content-html *, #page-content-html *{
            color:white;
          }
          .article-item, .article-content, .page-content{
            background-color:#000000a8
          }
          .article-item p, .article-item-sub, .article-content-sub, #page_order_html, #bottom_info_html{
            color:lightgrey!important;
          }
          a{
            color:#67a5ff
          }
          .card{
            background-color:black;
            color:white
          }
          `;
  localStorage.setItem("is_nightmode", "on");
};

const switch_to_light_mode = () => {
  document.querySelector("#whether_nightmode").innerHTML = "";
  localStorage.setItem("is_nightmode", "off");
};

const switch_theme_mode = () => {
  if (localStorage.getItem("is_nightmode") === "off") {
    switch_to_night_mode();
  } else if (localStorage.getItem("is_nightmode") === "on") {
    switch_to_light_mode();
  }
};

// init the nightMode status
if (localStorage.getItem("is_nightmode") === null || localStorage.getItem("is_nightmode") === undefined) {
  localStorage.setItem("is_nightmode", "off");
};

// enable the nightMode if it is the default choice
if (localStorage.getItem("is_nightmode") === "on") {
  switch_to_night_mode();
};

export { switch_theme_mode };
