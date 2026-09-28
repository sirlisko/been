import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement <dialog> methods
HTMLDialogElement.prototype.showModal = function () {
	this.open = true;
};
