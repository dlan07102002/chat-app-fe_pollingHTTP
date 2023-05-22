/**
 * Chuyển form từ login -> register và ngược lại -> doing
 * Thực hiện đăng ký và đăng nhập
 * Tạo tin nhắn khi click vào button send
 * Lấy messages từ server
 */

const app = {
    bindingEventHandlers() {
        // Ràng buộc logic cho nút `Register now`
        // Khi click thì sẽ chuyển sang form register
        const registerNowBtnEle = document.querySelector(".register-now");
        registerNowBtnEle.onclick = () => {
            // Hiện form register
            app.show(".register-form");
            // Ẩn form login
            app.hide(".login-form");
        };

        const loginNowBtnEle = document.querySelector(".login-now");
        loginNowBtnEle.onclick = () => {
            // Hiện form login
            app.show(".login-form");
            // Ẩn form register
            app.hide(".register-form");
        };

        // Ràng buộc logic cho nút đăng ký
        // Khi click thì sẽ gọi api đăng ký
        const registerBtnEle = document.querySelector(".register-button");
        registerBtnEle.onclick = () => {
            // Gọi api register
            // Gửi dữ liệu từ client lên server để tạo user
            const usernameInputEle = document.querySelector(".register-form .username-input");
            const emailInputEle = document.querySelector(".register-form .email-input");
            const passwordInputEle = document.querySelector(".register-form .password-input");

            if (!usernameInputEle.value.trim() || !emailInputEle.value.trim() || !passwordInputEle.value.trim()) {
                return;
            }

            // Tạo body từ value của các input
            const body = {
                username: usernameInputEle.value.trim(),
                email: emailInputEle.value.trim(),
                password: passwordInputEle.value.trim(),
            };

            fetch("http://localhost:3000/auth/register", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-type": "application/json",
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        return Promise.reject({
                            status: res.status,
                            statusText: res.statusText,
                        });
                    }
                    return res.json();
                })
                .then((res) => {
                    window.localStorage.setItem("user", JSON.stringify(res.data));
                    app.navigateToChat();
                });
        };

        const loginBtnEle = document.querySelector(".login-button");
        loginBtnEle.onclick = () => {
            const emailInputEle = document.querySelector(".login-form .email-input");
            const passwordInputEle = document.querySelector(".login-form .password-input");

            if (!emailInputEle.value.trim() || !passwordInputEle.value.trim()) {
                return;
            }

            const body = {
                email: emailInputEle.value.trim(),
                password: passwordInputEle.value.trim(),
            };

            fetch("http://localhost:3000/auth/login", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "content-type": "application/json",
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        return Promise.reject({
                            status: res.status,
                            statusText: res.statusText,
                        });
                    }

                    return res.json();
                })
                .then((res) => {
                    window.localStorage.setItem("user", JSON.stringify(res.data));
                    app.navigateToChat();
                });
        };

        const sendBtnEle = document.querySelector(".send-button");
        sendBtnEle.onclick = () => {
            const messageInputEle = document.querySelector(".message-input");
            const content = messageInputEle.value.trim();

            if (!content) {
                return;
            }
            const user = JSON.parse(window.localStorage.getItem("user"));
            const body = {
                user: user.username,
                content,
                userId: user.id
            };

            fetch("http://localhost:3000/messages", {
                method: "POST",
                body: JSON.stringify(body),
                headers: {
                    "Content-type": "application/json",
                },
            })
                .then((res) => {
                    if (!res.ok) {
                        return Promise.reject({
                            status: res.status,
                            statusText: res.statusText,
                        });
                    }

                    return res.json();
                })
                .then((res) => {
                    console.log(res);
                });

            messageInputEle.value = '';
        };
        const logoutBtnEle = document.querySelector('.logout-button');
        logoutBtnEle.onclick = () => {
            localStorage.removeItem('user');
            app.logOutChat()
        }
    },
    navigateToChat() {
        app.show(".chat-box");
        app.hide(".form");
        setInterval(app.renderMessages, 1000)
        // polling http
    },
    logOutChat() {
        app.hide(".chat-box");
        app.show(".form");
    },
    hide(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add("hidden");
        }
    },
    show(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.remove("hidden");
        }
    },
    renderMessages() {
        fetch("http://localhost:3000/messages")
            .then((res) => res.json())
            .then((res) => {
                const messages = res.data;
                const user = JSON.parse(window.localStorage.getItem("user"));
                console.log(user)
                const html = messages
                    .map((message) => {
                        const isMyMessage = message.userId === user.id;
                        if (isMyMessage) {
                            return `
                                <div class="message-item me">
                                    <div class="message-content">${message.content}</div>
                                </div>
                            `;
                        }
                        return `
                            <div class="message-item">
                                <div class="username">${message.user}</div>
                                <div class="message-content">${message.content}</div>
                            </div>
                        `;
                    })
                    .join("");

                const messageListEle = document.querySelector(".message-list");
                messageListEle.innerHTML = html;
            });
    },
    run() {
        app.bindingEventHandlers();
        const user = window.localStorage.getItem("user");
        if (user) {
            app.navigateToChat();
        }
        console.log("App is running...");
    },
};

app.run();