$(".Effect-effectFadeIn").click(function () {
	var e = $(this).parent().parent();
	e.addClass("effectFadeIn"),
		e.delay(500).fadeOut("slow", function () {
			$(this).remove();
		});
}),
	ScrollReveal().reveal("#nav-top", {
		origin: "top",
		distance: "10px",
		duration: 1e3,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".top", {
		origin: "top",
		distance: "50px",
		duration: 400,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".top1", {
		origin: "top",
		distance: "50px",
		duration: 800,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".top2", {
		origin: "top",
		distance: "50px",
		duration: 1200,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".top3", {
		origin: "top",
		distance: "50px",
		duration: 1600,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".right", {
		origin: "right",
		distance: "50px",
		duration: 400,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".right1", {
		origin: "right",
		distance: "50px",
		duration: 800,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".right2", {
		origin: "right",
		distance: "50px",
		duration: 1200,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".right3", {
		origin: "right",
		distance: "50px",
		duration: 1600,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".left", {
		origin: "left",
		distance: "50px",
		duration: 400,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".left1", {
		origin: "left",
		distance: "50px",
		duration: 800,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".left2", {
		origin: "left",
		distance: "50px",
		duration: 1200,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".left3", {
		origin: "left",
		distance: "50px",
		duration: 1600,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".bottom", {
		delay: 400,
		origin: "bottom",
		distance: "50px",
		duration: 400,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".bottom1", {
		delay: 400,
		origin: "bottom",
		distance: "50px",
		duration: 800,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".bottom2", {
		delay: 400,
		origin: "bottom",
		distance: "50px",
		duration: 1200,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".bottom3", {
		delay: 400,
		origin: "bottom",
		distance: "50px",
		duration: 1600,
		viewFactor: 0.8,
	}),
	ScrollReveal().reveal(".fad-in", {
		delay: 1e3,
		origin: "bottom",
		distance: "50px",
		duration: 400,
		viewFactor: 0.8,
	});
