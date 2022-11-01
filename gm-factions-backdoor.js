/*
TITLE: Factions Backdoor Script
AUTHOR:	GamerMaverick
VERSION: Bitburner 2.01
USAGE: Pre-BN4 script to connect to faction servers and backdoor them using console. Faction servers "CSEC","avmnite-02h","I.I.I.I","run4theh111z","The-Cave", and "w0r1d_d43m0n" are hardcoded.
REFERENCE: https://www.reddit.com/r/Bitburner/comments/s793dp/search_for_server_output_is_path_to_the_server/
*/

const findPath = (ns, target, serverName, serverList, ignore, isFound) => {
	ignore.push(serverName);
	let scanResults = ns.scan(serverName);
	for (let server of scanResults) {
		if (ignore.includes(server)) {
			continue;
		}
		if (server === target) {
			serverList.push(server);
			return [serverList, true];
		}
		serverList.push(server);
		[serverList, isFound] = findPath(ns, target, server, serverList, ignore, isFound);
		if (isFound) {
			return [serverList, isFound];
		}
		serverList.pop();
	}
	return [serverList, false];
}


/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
	ns.disableLog("ALL");
	ns.clearLog();
	let startServer = ns.getHostname();
	let targets = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", "The-Cave", "w0r1d_d43m0n"];

	try {
		ns.print("**Starting factions backdoor, hack lvl " + ns.getPlayer().skills.hacking + "**");
		ns.print("WARNING! DO NOT CHANGE FOCUS UNTIL SCRIPT IS COMPLETED");
		ns.print(" ");

		//SERVER INDEXING LOOP
		for (let target of targets) {
			if (target === undefined) {
				ns.alert('Please provide target server');
				return;
			}
			let [results, isFound] = findPath(ns, target, startServer, [], [], false);
			if (!isFound) {
				ns.print("" + target + " ERROR. Server not found!");
				ns.print(" ");
			}
			else {


				//BACKDOOR PREPPER
				try { ns.brutessh(target); } catch { };
				try { ns.ftpcrack(target); } catch { };
				try { ns.relaysmtp(target); } catch { };
				try { ns.httpworm(target); } catch { };
				try { ns.sqlinject(target); } catch { };
				try { ns.nuke(target); } catch { };

				//CONSOLE INPUT TO CONNECT AND BACKDOOR
				const terminalInput = document.getElementById("terminal-input");
				terminalInput.value = "home;connect " + results.join(';connect ') + ";backdoor";
				const handler = Object.keys(terminalInput)[1];
				terminalInput[handler].onChange({ target: terminalInput });
				terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });

				//SLEEP COMMAND UNTIL BACKDOOR COMPLETED
				if (ns.getPlayer().skills.hacking >= ns.getServerRequiredHackingLevel(target)) {
					await ns.asleep(8000);
				}

				//CONSOLE INPUT TO RETURN HOME
				terminalInput.value = "home";
				terminalInput[handler].onChange({ target: terminalInput });
				terminalInput[handler].onKeyDown({ key: 'Enter', preventDefault: () => null });

				//NOTIFICATION
				if (ns.getServer(target).backdoorInstalled) {
					ns.print("" + target + " SUCCESS.")
				}
				else {
					if (ns.getPlayer().skills.hacking >= ns.getServerRequiredHackingLevel(target)) {
						ns.print("" + target + " ERROR, Closed Ports.")
					}
					else {
						ns.print("" + target + " ERROR. Req hack lvl " + ns.getServerRequiredHackingLevel(target) + "");
					}
				}
				ns.print(" ");
			}
		}
	} catch { ns.alert("REQUIRES TERMINAL WINDOW FOCUS"); }

}
