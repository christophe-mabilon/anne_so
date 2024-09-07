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
let data = [
	{ type: "Autre (Merci de pr\xe9ciser)" },
	{ itype: "Abri de jardin" },
	{ type: "Abri de piscine" },
	{ type: "Chape" },
	{ type: "Cl\xf4ture" },
	{ type: "Construction garage" },
	{ type: "Construction maison" },
	{ type: "Dallage" },
	{ type: "D\xe9molition (b\xe2timent, murs...)" },
	{ type: "Escaliers" },
	{ type: "Extension maison" },
	{ type: "Fondation" },
	{ type: "Gros oeuvre" },
	{ type: "Piscine" },
	{ type: "Petits travaux de ma\xe7onnerie" },
	{ type: "Cr\xe9ation d'ouverture" },
	{ type: "Sol b\xe9ton" },
	{ type: "Sur\xe9l\xe9vation" },
	{ type: "Terrasse" },
	{ type: "Carrelage" },
	{ type: "Petite charpente" },
];
if (
	((jobType = document.getElementById("jobType")),
	(data = data.filter((e) => e.type)).sort((e, t) =>
		e.type.localeCompare(t.type)
	),
	jobType)
)
	for (let i = 0; i < data.length; i++) {
		let e = document.createElement("option");
		(e.value = data[i].type), (e.text = data[i].type), jobType.add(e);
	}
