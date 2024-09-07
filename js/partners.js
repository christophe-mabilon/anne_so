const jobList = [
	{ id: 1, name: "Carreleurs", count: 0 },
	{ id: 2, name: "Charpentiers", count: 0 },
	{ id: 3, name: "Électriciens", count: 0 },
	{ id: 4, name: "Menuisiers", count: 0 },
	{ id: 5, name: "Peintres", count: 0 },
	{ id: 6, name: "Plombiers", count: 0 },
	{ id: 7, name: "Couvreurs", count: 0 },
	{ id: 8, name: "Façadiers", count: 0 },
	{ id: 9, name: "Plaquistes", count: 0 },
	{ id: 10, name: "Ramoneurs", count: 0 },
	{ id: 11, name: "Serruriers", count: 0 },
];

const partners = [
	{
		job: "Électriciens",
		name: "JS ELEC",
		logo: "https://jselec38.fr/wp-content/uploads/2021/09/cropped-LOGO-JSE.png",
		logoAlt: "entreprise électricien Bourgoin-Jalieu",
		servicesTypes: "Entreprise d'électricité générale",
		siret: "817999261000032",
		location: "86 Chem. de la Cigalière, 38300 Maubec",
		description: `<p>
      Notre entreprise propose des interventions dans le domaine
      de l'électricité générale et vous assure un travail
      réalisé avec soin et professionnalisme.
    </p>

    <p>
      Nos prestations s'adressent aux particuliers ou aux
      professionnels, pour de la rénovation ou du neuf.
    </p>
    <p>
      Pour des conseils avisés sur les travaux à entreprendre,
      n'hésitez pas à nous contacter.
    </p>`,
		webSite: "https://jselec38.fr/",
	},
];

countPartners(partners);

function countPartners(partners) {
	const jobCountMap = {};

	partners.forEach((partner) => {
		const jobName = partner.job;
		jobCountMap[jobName] = (jobCountMap[jobName] ?? 0) + 1;
	});

	jobList.forEach((job) => {
		const jobName = job.name;
		job.count = jobCountMap[jobName] || 0;
	});

	setJobList();
}

function setJobList() {
	const htmlJobList = document.getElementById("jobList");

	// Clear existing content
	htmlJobList.innerHTML = "";

	jobList.forEach((job) => {
		const li = document.createElement("li");
		li.className = "col-6 col-sm-4 col-md-3 col-xl-1 text-dark p-1 my-2";

		const button = document.createElement("button");
		button.type = "button";
		button.className = "job btn btn-primary position-relative w-100";
		button.onclick = () => filterPartnersList(job.name);

		button.innerHTML = `
      ${job.name}
      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill ${
				job.count > 0 ? "bg-warning" : "bg-danger"
			}">
        ${job.count}
      </span>
    `;

		li.appendChild(button);
		htmlJobList.appendChild(li);
	});
}

filterPartnersList();

function filterPartnersList(jobfilter) {
	let selectPatrners = [...partners];
	if (jobfilter) {
		const selectedPartners = partners.filter(
			(partner) => !jobfilter || partner.job === jobfilter
		);
		// Use the selectedPartners array instead of the original partners array
		selectPatrners = selectedPartners;
	}

	// Group partners by job title
	const groupedPartners = selectPatrners.reduce((acc, partner) => {
		const job = partner.job;
		if (!acc[job]) {
			acc[job] = [];
		}
		acc[job].push(partner);
		return acc;
	}, {});

	// Sort the groups alphabetically
	const sortedJobTitles = Object.keys(groupedPartners).sort();

	// Create HTML dynamically
	const listContainer = document.getElementById("partnerList");
	listContainer.innerHTML = "";

	const emptyListText = document.getElementById("emptyList");
	if (selectPatrners.length === 0) {
		emptyListText.classList.remove("d-none");
	} else {
		emptyListText.classList.add("d-none");
	}

	sortedJobTitles.forEach((jobTitle) => {
		const jobPartners = groupedPartners[jobTitle];

		const jobSection = document.createElement("div");
		jobSection.innerHTML = `<h4 id="${jobTitle}" class="text-primary mt-4">${jobTitle} <span class="fs-5">(${jobPartners.length})</span></h4>
      <ul class="list-group my-3"></ul>`;
		listContainer.appendChild(jobSection);

		const ul = jobSection.querySelector("ul");

		jobPartners.forEach((partner) => {
			const li = document.createElement("li");
			li.className = "list-group-item py-0 shadow-card my-3 border";
			li.innerHTML = `<div class="row align-items-strech">
          <div class="col-12 col-xl-3 align-self-stretch h-100">
            <div class="d-block align-items-center">
              <a href="${partner.webSite}"rel="follow" target="_blank">
                <img class="col-12" title="${partner.name}"loading="eager"
                width="340px"
                height="auto" src="${partner.logo}" alt="${partner.logoAlt}" />
              </a>
              
            </div>
          </div>
          <div class="d-block"><span class="fs-4 fw-bolder">${partner.name}</span><hr class="text-primary" />
          </div>
        </div>
        <div class="row align-items-top">
          <div class="col-12 col-xl-3 border-left p-3">
            <div class="d-block">
              <p class="fw-bolder">Type de services</p>
              <p>${partner.servicesTypes}</p>
            </div>
            <hr class="text-primary" />
            <div class="d-block">
              <p class="fw-bolder">Numéro de siret :</p>
              <p>${partner.siret}</p>
            </div>
            <hr class="text-primary" />
            <div class="d-block">
              <p class="fw-bolder">Localisation</p>
              <p>${partner.location}</p>
            </div>
          </div>
          <hr class="d-block d-xl-none text-primary" />
          <div class="d-block d-xl-flex col-xl-9">
            <div class="d-block">
              <p id="description" class="fw-bolder">Description de l'entreprise</p>
              ${partner.description}
              <div class="text-start my-5">
                <p id="website" class="fw-bolder">site web :</p>
                <a class="text-primary" rel="follow" target="_blank" href="${partner.webSite}">${partner.servicesTypes} ${partner.name}</a>
              </div>
            </div>
          </div>
        </div>`;

			ul.appendChild(li);
		});
	});
}
