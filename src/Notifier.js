import { notification } from "./store.js";
export function send(message, type = "default", timeout,typeOfNotification) {
	notification.set({ type, message, timeout,typeOfNotification });
}
export function danger(msg,typeOfNotification, timeout) {
	send(msg, "danger", timeout,typeOfNotification);
}
export function warning(msg,typeOfNotification,timeout) {
	send(msg, "warning", timeout,typeOfNotification);
}
export function info(msg,typeOfNotification,timeout) {
	send(msg, "info", timeout,typeOfNotification);
}
export function success(msg,typeOfNotification, timeout) {
	send(msg, "success", timeout,typeOfNotification);
}