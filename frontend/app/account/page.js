"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {


    const [balance, setBalance] = useState(0);

    const [transaction, setTransaction] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false)


    // async function handleBalance(event) {
    //     event.preventDefault();

    //     const data = localStorage.getItem("sessionToken")

    //     const response = await fetch("http://localhost:3001/me/accounts", {
    //         method: "POST",
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({ "token": data })
    //     })

    //     const accountData = await response.json();
    //     setBalance(accountData.amount);
    // }

    async function handleTransaction(event) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const inputAmount = Object.fromEntries(formData);
        const data = localStorage.getItem("sessionToken")

        const response = await fetch("http://localhost:3001/me/accounts/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ "token": data, "amount": Number(inputAmount.amount) })
        })

        if (response.ok) {
            setShowConfirmation(true)
            setBalance(prev => prev + Number(inputAmount.amount))
        }

    }

    return (
        <div className="flex h-screen overflow-hidden flex-col font-sans dark:bg-black ">
            <div className="bg-pink-400 text-center h-20 items-center justify-center flex w-full shrink-0 gap-4">
                <div className="text-4xl flex items-center font-bold font-autour">
                    BankSajt.se
                </div>
                <div className="flex flex-col items-center">
                    <p>
                        Välkommen till BankSajt.se
                    </p>
                    <p className="italic text-sm">
                        – Sajten för Din Bank
                    </p>
                </div>
            </div>
            <main className="main-content flex min-h-0 flex-1">
                <div className="sidebar w-max-[30%] flex-1 bg-pink-300 p-8 ">
                    <div className="flex flex-col *:bg-pink-500 *:rounded-4xl *:p-3 *:m-3 *:text-black *:border-3 *:uppercase *:font-bold *:hover:bg-pink-400 *:hover:cursor-pointer *:hover:border-pink-600 text-center *:text-nowrap font-autour">
                        <Link
                            href={"/"}>
                            Startsida
                        </Link>
                        <Link
                            href={"/"}>
                            Logga ut
                        </Link>
                    </div>
                </div>
                <div className="content-section w-full">
                    <div className="hero-section flex flex-col relative w-full h-full p-8 items-start">
                        <span className="text-3xl mb-1">
                            Välkommen!
                        </span>
                        <p className="text-xl mb-2">
                            Kontohantering:
                        </p>
                        

                            <div className="flex gap-2 bg-pink-200 p-4 mb-3 z-10">
                                <span className="font-bold">
                                    Aktuellt saldo:
                                </span>
                                <span>
                                    {balance}
                                </span>
                                <span>
                                    sek
                                </span>
                            </div>

                            <form
                                className="bg-pink-200 p-4 flex flex-col justify-center items-center z-10"
                                onSubmit={handleTransaction}
                            >
                                <div className="flex gap-2 items-center mb-3">
                                    <label
                                        htmlFor="amount"
                                        className="font-bold">
                                        Summa
                                    </label>
                                    <input
                                        name="amount"
                                        id="amount"
                                        placeholder="Mängd"
                                        className="p-3 pl-5 border-3 rounded-4xl bg-white z-10"
                                        type="number"
                                    />
                                </div>
                                <input
                                    type="submit"
                                    value="Sätt in"
                                    className="bg-pink-500 rounded-4xl p-3 border-3 uppercase font-bold hover:bg-pink-400 hover:cursor-pointer hover:border-pink-600 z-10 font-autour w-fit"
                                />
                                {showConfirmation && (
                                    <p className="mt-2">
                                        Insättning validerad! ✓
                                    </p>
                                )}
                            </form>


                        <img
                            alt="Piggy Bank Logo"
                            src="/logo.png"
                            width={300}
                            height={300}
                            className="absolute left-8 bottom-8 opacity-20 z-1"
                        />
                    </div>
                </div>
            </main >
        </div >
    );
}
