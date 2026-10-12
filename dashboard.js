const apiUrl = "https://jsonplaceholder.typicode.com/users";
const loadingMessage = document.querySelector("#loading-message");
const errorMessage = document.querySelector("#error-message");
const userSearch = document.querySelector("#user-search");
const usersTableBody = document.querySelector("#users-table-body");
const usersEmptyMessage = document.querySelector("#users-empty-message");

const transactionRows = [...document.querySelectorAll("#transaction-rows tr")];
const transactionSearch = document.querySelector("#transaction-search");
const channelFilter = document.querySelector("#channel-filter");
const statusFilter = document.querySelector("#status-filter");
const transactionEmptyMessage = document.querySelector("#empty-state");
const transactionResultCount = document.querySelector("#result-count");
const transactionPagination = document.querySelector("#transaction-pagination");
const dialog = document.querySelector("#action-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogContent = document.querySelector("#dialog-content");
const pageSize = 3;

let users = [];
let currentTransactionPage = 1;
let dialogOpener = null;

function renderUsers() {
    const searchTerm = userSearch.value.trim().toLowerCase();
    const matchingUsers = users.filter((user) =>
        [user.name, user.email, user.address.city]
            .some((value) => value.toLowerCase().includes(searchTerm))
    );

    usersTableBody.replaceChildren();

    matchingUsers.forEach((user) => {
        const row = document.createElement("tr");

        [user.name, user.email, user.address.city].forEach((value) => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.append(cell);
        });

        usersTableBody.append(row);
    });

    usersEmptyMessage.hidden = matchingUsers.length > 0;
}

function getFilteredTransactions() {
    const searchTerm = transactionSearch.value.trim().toLowerCase();
    const channel = channelFilter.value;
    const status = statusFilter.value;

    return transactionRows.filter((row) => {
        const matchesSearch = row.textContent.toLowerCase().includes(searchTerm);
        const matchesChannel = !channel || row.dataset.channel === channel;
        const matchesStatus = !status || row.dataset.status === status;
        return matchesSearch && matchesChannel && matchesStatus;
    });
}

function makePageButton(label, page, accessibleLabel, disabled = false, current = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-label", accessibleLabel);
    button.disabled = disabled;

    if (current) {
        button.classList.add("current-page");
        button.setAttribute("aria-current", "page");
    }

    button.addEventListener("click", () => {
        currentTransactionPage = page;
        renderTransactions();
    });
    return button;
}

function renderPagination(pageCount) {
    transactionPagination.replaceChildren();
    transactionPagination.append(
        makePageButton("←", currentTransactionPage - 1, "Previous page", currentTransactionPage === 1)
    );

    for (let page = 1; page <= pageCount; page += 1) {
        transactionPagination.append(
            makePageButton(String(page), page, `Page ${page}`, false, page === currentTransactionPage)
        );
    }

    transactionPagination.append(
        makePageButton("→", currentTransactionPage + 1, "Next page", currentTransactionPage === pageCount)
    );
}

function renderTransactions() {
    const matchingRows = getFilteredTransactions();
    const pageCount = Math.max(1, Math.ceil(matchingRows.length / pageSize));
    currentTransactionPage = Math.min(currentTransactionPage, pageCount);
    const firstVisibleIndex = (currentTransactionPage - 1) * pageSize;
    const visibleRows = new Set(matchingRows.slice(firstVisibleIndex, firstVisibleIndex + pageSize));

    transactionRows.forEach((row) => {
        row.hidden = !visibleRows.has(row);
    });

    transactionEmptyMessage.hidden = matchingRows.length > 0;
    const firstResult = matchingRows.length ? firstVisibleIndex + 1 : 0;
    const lastResult = Math.min(firstVisibleIndex + pageSize, matchingRows.length);
    transactionResultCount.textContent =
        `Showing ${firstResult}–${lastResult} of ${matchingRows.length} sample transactions`;
    renderPagination(pageCount);
}

function openDialog(title, content, opener = document.activeElement) {
    dialogTitle.textContent = title;
    dialogContent.replaceChildren(content);
    dialogOpener = opener;
    dialog.showModal();
}

function makeParagraph(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    return paragraph;
}

function makeDetailsList(items) {
    const list = document.createElement("dl");
    list.className = "dialog-details";

    items.forEach(([label, value]) => {
        const term = document.createElement("dt");
        term.textContent = label;
        const description = document.createElement("dd");
        description.textContent = value;
        list.append(term, description);
    });

    return list;
}

function openAccountDialog() {
    const content = document.createElement("div");
    content.append(
        makeDetailsList([
            ["Account", "Gladys Amoah"],
            ["Role", "Operations admin"],
            ["Environment", "Dashboard demo"]
        ])
    );

    const signOutLink = document.createElement("a");
    signOutLink.className = "dialog-link";
    signOutLink.href = "login.html";
    signOutLink.textContent = "Go to sign-in page";
    content.append(signOutLink);
    openDialog("Account", content);
}

function openNotificationsDialog() {
    const list = document.createElement("ul");
    list.className = "dialog-list";

    [
        "Your dashboard is showing sample transaction data.",
        "A demo merchant settlement is marked completed.",
        "All notification items are examples, not live alerts."
    ].forEach((message) => {
        const item = document.createElement("li");
        item.textContent = message;
        list.append(item);
    });

    openDialog("Notifications", list);
}

function exportTransactions() {
    const headers = ["Transaction ID", "Customer", "Email", "Channel", "Date & time", "Amount", "Status"];
    const csvRows = [
        headers,
        ...getFilteredTransactions().map((row) => [
            row.querySelector(".transaction-id").textContent.trim(),
            row.querySelector(".customer-cell strong").textContent.trim(),
            row.querySelector(".customer-cell small").textContent.trim(),
            row.dataset.channel,
            row.cells[3].textContent.trim(),
            row.cells[4].textContent.trim(),
            row.dataset.status
        ])
    ];
    const csv = csvRows
        .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
        .join("\r\n");
    const downloadUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = "ghipss-demo-transactions.csv";
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

function openTransactionDetails(row) {
    const content = makeDetailsList([
        ["Transaction ID", row.querySelector(".transaction-id").textContent.trim()],
        ["Customer", row.querySelector(".customer-cell strong").textContent.trim()],
        ["Email", row.querySelector(".customer-cell small").textContent.trim()],
        ["Channel", row.dataset.channel],
        ["Date & time", row.cells[3].textContent.trim()],
        ["Amount", row.cells[4].textContent.trim()],
        ["Status", row.dataset.status]
    ]);
    openDialog("Transaction details", content);
}

async function loadUsers() {
    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`The users service returned ${response.status}.`);
        }

        const result = await response.json();

        if (!Array.isArray(result) || !result.every((user) =>
            typeof user.name === "string" &&
            typeof user.email === "string" &&
            typeof user.address?.city === "string"
        )) {
            throw new Error("The users service returned data in an unexpected format.");
        }

        users = result;
        renderUsers();
        userSearch.disabled = false;
        loadingMessage.hidden = true;
    } catch (error) {
        loadingMessage.hidden = true;
        errorMessage.textContent = `Unable to load users. ${error.message}`;
        errorMessage.hidden = false;
    }
}

transactionSearch.addEventListener("input", () => {
    currentTransactionPage = 1;
    renderTransactions();
});
channelFilter.addEventListener("change", () => {
    currentTransactionPage = 1;
    renderTransactions();
});
statusFilter.addEventListener("change", () => {
    currentTransactionPage = 1;
    renderTransactions();
});
userSearch.addEventListener("input", renderUsers);
document.querySelector("#export-report").addEventListener("click", exportTransactions);
document.querySelector("#report-range").addEventListener("change", (event) => {
    const notice = document.querySelector("#range-notice");
    notice.textContent =
        `Report period set to ${event.target.selectedOptions[0].text}. These figures are sample data; changing the reporting period does not load live results.`;
    notice.hidden = false;
});
document.querySelector("#view-all-transactions").addEventListener("click", () => {
    transactionSearch.value = "";
    channelFilter.value = "";
    statusFilter.value = "";
    currentTransactionPage = 1;
    renderTransactions();
});
document.querySelector(".notification-button").addEventListener("click", openNotificationsDialog);
document.querySelectorAll(".account-button, .profile-menu").forEach((button) => {
    button.addEventListener("click", openAccountDialog);
});
document.querySelector(".more-button").addEventListener("click", () => {
    const content = document.createElement("ul");
    content.className = "dialog-list";
    [
        "Mobile Money: 52% of sample payments",
        "GhIPSS Instant Pay: 26% of sample payments",
        "Bank cards: 15% of sample payments",
        "Other channels: 7% of sample payments"
    ].forEach((summary) => {
        const item = document.createElement("li");
        item.textContent = summary;
        content.append(item);
    });
    openDialog("Payment channel breakdown", content);
});
document.querySelectorAll(".row-menu").forEach((button) => {
    button.addEventListener("click", () => openTransactionDetails(button.closest("tr")));
});
document.querySelector(".settlement-details").addEventListener("click", () => {
    openDialog(
        "Settlement details",
        makeDetailsList([
            ["Settlement", "Daily merchant settlement"],
            ["Network", "GhIPSS Instant Pay"],
            ["Date", "24 Nov (sample data)"],
            ["Amount", "GH₵ 42,580.00"],
            ["Status", "Completed (demo)"]
        ])
    );
});
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
        dialog.close();
    }
});
dialog.addEventListener("close", () => {
    if (dialogOpener instanceof HTMLElement && dialogOpener.isConnected) {
        dialogOpener.focus();
    }
    dialogOpener = null;
});
document.querySelectorAll(".side-nav a, .settings-link, .brand").forEach((link) => {
    link.addEventListener("click", () => {
        const target = link.getAttribute("href");
        if (!target?.startsWith("#")) {
            return;
        }

        document.querySelectorAll(".side-nav .nav-item").forEach((item) => {
            const isCurrent = item.getAttribute("href") === target;
            item.classList.toggle("active", isCurrent);
            if (isCurrent) {
                item.setAttribute("aria-current", "page");
            } else {
                item.removeAttribute("aria-current");
            }
        });
    });
});

const settingsForm = document.querySelector("#settings-form");
const settingsFeedback = document.querySelector("#settings-feedback");
const alertPreferences = [...settingsForm.querySelectorAll('input[type="checkbox"]')];
const preferencesKey = "ghipss-dashboard-alert-preferences";

try {
    const savedPreferences = JSON.parse(localStorage.getItem(preferencesKey));
    if (savedPreferences && typeof savedPreferences === "object") {
        alertPreferences.forEach((checkbox) => {
            if (typeof savedPreferences[checkbox.name] === "boolean") {
                checkbox.checked = savedPreferences[checkbox.name];
            }
        });
    }
} catch (error) {
    settingsFeedback.textContent = "Saved preferences could not be read in this browser.";
}

settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const preferences = Object.fromEntries(
        alertPreferences.map((checkbox) => [checkbox.name, checkbox.checked])
    );

    try {
        localStorage.setItem(preferencesKey, JSON.stringify(preferences));
        settingsFeedback.textContent = "Preferences saved in this browser.";
    } catch (error) {
        settingsFeedback.textContent = "Preferences could not be saved in this browser.";
    }
});

renderTransactions();
loadUsers();
