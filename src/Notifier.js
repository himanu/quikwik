import { notification } from "./store.js";
export function send(message, type = "default", timeout,typeOfNotification) {
	notification.set({ type, message, timeout,typeOfNotification });
}
export function danger(msg, timeout) {
	send(msg, "danger", timeout);
}
export function warning(msg, timeout) {
	send(msg, "warning", timeout);
}
export function info(msg,typeOfNotification,timeout) {
	send(msg, "info", timeout,typeOfNotification);
}
export function success(msg, timeout) {
	send(msg, "success", timeout);
}