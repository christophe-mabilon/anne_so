const jobList = [
	{ id: 1, name: "Formations", count: 0 },
	{ id: 2, name: "Psychogenealogie", count: 1 },
	{ id: 2, name: "Écriture intuitive", count: 0 },
	{ id: 2, name: "Numérologie", count: 0 },
	{ id: 2, name: "Hypnose ", count: 0 },
];

const partners = [
	{
		job: "Psychogenealogie",
		name: "PSYCHOGENEALOGISTE",
		logo: "https://www.psychogenealogiste.org/Files/Image/GALERIE/CIP-FR.png",
		logoAlt: "Psychogenealogie",
		servicesTypes: "psychogenealogiste",
		siret: "23220501361",
		location: "Möckernsche Straße 23 - DE-04155 Leipzig",
		description: `<p>
      
    </p>`,
		webSite: "https://www.psychogenealogiste.org",
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
	htmlJobList.className = "list-style-none";

	jobList.forEach((job) => {
		const li = document.createElement("li");
		li.className = "col-auto text-dark p-1 my-2";

		const button = document.createElement("button");
		button.type = "button";
		button.className = "job btn btn-green-dark position-relative w-100";
		button.onclick = () => filterPartnersList(job.name);

		button.innerHTML = `
      ${job.name}
      <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill ${
				job.count > 0 ? "btn-green-dark-2" : "bg-brun"
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
          <div class="col-12 col-xl-auto align-self-stretch h-100">
            <div class="d-block align-items-center">
              <a href="${partner.webSite}"rel="follow" target="_blank">
                <img class="partner-logo" title="${partner.name}"loading="eager" 
                width="150px"
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
                <a class="text-primary" rel="follow" target="_blank" href="${partner.webSite}">${partner.name}</a>
              </div>
            </div>
          </div>
        </div>`;

			ul.appendChild(li);
		});
	});
}
