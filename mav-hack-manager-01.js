/*
SOURCE:https://steamcommunity.com/sharedfiles/filedetails/?id=2686833015
AUTHOR: PG SDVX
DATE: 31 Mar @ 12:06pm
DETAILS:
Here we go again, V3 has arrived!
Hello once more, today I bring you a better chunk of code!
100% plug and play, but put it in a .ns file instead of .script, create in and run from home
This guide has less documentation, but much higher gains than the last
Let me know if there is any issue you can see, or any way to improve it further :)

NOTICE: It will automatically create/overwrite 3 files in the home directory called "weak.script", "grow.script" and "hack.script" and uses 14.8GB to run without modules, 20.05GB with
Server RAM utilisation may temporarily be low when weakening, this is intended
Also it takes a while to warm up the wallets before the farming can start

- Advanced Update -
Rewrote the code to be cleaner and to work better, gains increased further
Leaving old code here so that people can move up from the basic if they're studying it
Old modules will work only with intermediate version, advanced has them preinstalled

VERSION CONTROL
22/10/13-OG- await ns.scp(files, server, 'home')//OG-Prev: await ns.scp(files, 'home', server)
*/

/** @param {NS} ns**/
export async function main(ns) {
	ns.disableLog('ALL');

	//Welcome to the Auto Farm part 2: Electric Boogaloo - Advanced Edition
	//This script is a little more complicated to explain easily, it dedicates high RAM servers to attack high profit servers
	//This is also set and forget, your EXEs and hacking level are reacquired each second, so new servers are added without needing to reboot it
	//Well I hope this brings you ideas, knowledge and or profits :D

	var files = ['grow.script', 'weak.script', 'hack.script'];
	await ns.write(files[0], 'grow(args[0])', 'w'); await ns.write(files[1], 'weaken(args[0])', 'w'); await ns.write(files[2], 'hack(args[0])', 'w');

	var exclude = [''] //Servers names that won't be used as hosts or deleted
	
	const Servers = ns.scan('home')
	const filterBy = str => Servers.filter(
		Servers => new RegExp('^' + str.replace(/\*/g, '.*') + '$').test(Servers)
	);

	exclude = filterBy('hacknet*')//MAV: Filter out Hacknet Servers


	var servers; var hosts; var targets; var exes; var tarIndex; var loop; var hType; var tmp; var act;
	var netManager = false; var serverManager = false;
	var cycle = [0, '▄', '█', '▀', '█'];
	if (false) { brutessh(); ftpcrack(); relaysmtp(); httpworm(); sqlinject() }

	const checkM = (c, d) => eval(c < ns.getPlayer().money / d)
	const arraySort = (arr) => arr.sort((a, b) => b[0] - a[0])
	function str(s) { if (s.length > 14) { return s.substring(0, 14) + '...' } else { return s } }
	function info(t, s) {
		if (t == 'MM') { return ns.getServerMaxMoney(s) }
		if (t == 'MA') { return ns.getServerMoneyAvailable(s) }
		if (t == 'MR') { return ns.getServerMaxRam(s) }
		if (t == 'UR') { return ns.getServerUsedRam(s) }
		if (t == 'NPR') { return ns.getServerNumPortsRequired(s) }
		if (t == 'RHL') { return ns.getServerRequiredHackingLevel(s) }
		if (t == 'SL') { return ns.getServerSecurityLevel(s) }
		if (t == 'MSL') { return ns.getServerMinSecurityLevel(s) }
	}

	async function scanExes() {
		for (let hack of ['brutessh', 'ftpcrack', 'relaysmtp', 'sqlinject', 'httpworm']) {
			if (ns.fileExists(hack + '.exe')) {
				exes.push(hack)
			}
		}
	}

	function log() {
		if (cycle[0] >= 4) { cycle[0] = 0 }; cycle[0]++; //ns.clearLog();
		ns.print('╔═══╦════════════════════════════════════╗')
		tmp = targets.slice(0, 12)
		ns.print(`║ ${cycle[cycle[0]]} ║ HIGH PROFIT            BALANCE     ║`)
		for (let t of tmp) {
			ns.print(`║ ${act[t[1]]} ║ ${str(t[1])}` + `${ns.nFormat(info('MA', t[1]), '0a')} / ${ns.nFormat(info('MM', t[1]), '0a')} : ${ns.nFormat(info('MA', t[1]) / info('MM', t[1]), '0%')} ║`.padStart(36 - str(t[1]).length))
		}
		ns.print('╠═══╩════════════════════════════════════╣')
		ns.print(`║ EXE ${exes.length}/5 ║ HOSTS ${hosts.length} ║ TARGETS ${targets.length}`.padEnd(41), '║')
		ns.print('╠════════════════════════════════════════╣')

		if (netManager || serverManager) {
			tmp = '║ MANAGER'
			if (netManager) { tmp += ' ║ HN-Nodes ' + ns.hacknet.numNodes() }
			if (serverManager) { tmp += ' ║ P-Servers ' + ns.getPurchasedServers().length }
			ns.print(tmp + '\n╚════════════════════════════════════════╝')
		}
	}

	async function scanServers(host, current) {//Combined scan and check
		for (let server of ns.scan(current)) {
			if ((ns.getPurchasedServers().includes(server) || info('NPR', server) <= exes.length) && host != server) {
				if (!ns.getPurchasedServers().includes(server)) { for (let hack of exes) { ns[hack](server) }; ns.nuke(server) }
				if (info('MM', server) != 0 && info('RHL', server) <= ns.getHackingLevel() && info('MSL', server) < 100) {
					targets.push([Math.floor(info('MM', server) / info('MSL', server)), server]); targets = arraySort(targets)
				}
				if (info('MR', server) > 4 && !exclude.includes(server)) { hosts.push([info('MR', server), server]); hosts = arraySort(hosts) }
				servers.push(server)
				await ns.scp(files, server, 'home')//OG-Prev: await ns.scp(files, 'home', server)
				await scanServers(current, server)
			}
		}
	}

	async function hackAll() {//Dedicates high RAM servers to high value ones
		for (let host of hosts) {
			if (tarIndex > targets.length - 1) { tarIndex = 0; loop = true };
			let target = targets[tarIndex][1];
			function fRam() { return info('MR', host[1]) - info('UR', host[1]) }
			if (info('MA', target) < info('MM', target) * .80) { hType = 0 }
			else if (info('SL', target) > info('MSL', target) + 5 || loop) {
				hType = 1;
				if (fRam() / info('MR', host[1]) > .13 && fRam() > 4) {
					tmp = Math.floor(fRam() / 1.75); if (tmp > 0) { ns.exec(files[1], host[1], tmp, target) }
				}
			} else {
				hType = 2; for (let h of hosts) { if (ns.isRunning(files[2], h[1], target) && h[1] != host[1]) { hType = 0; break } }
				if (hType == 2 && !ns.scriptRunning(files[2], host[1])) {
					if (fRam() < 2) { ns.killall(host[1]) }
					tmp = [1, Math.floor(fRam() / 1.7)]; while (ns.hackAnalyze(target) * tmp[0] < .7 && tmp[0] < tmp[1]) { tmp[0]++ }
					ns.exec(files[2], host[1], tmp[0], target)
				}
			}
			if ((hType == 0 || hType == 2) && fRam() > 3.9) {
				tmp = [Math.ceil(info('MR', host[1]) / 1.75 * .14), Math.floor(info('MR', host[1]) / 1.75 * .79)]
				if (tmp[1] > 0 && fRam() / info('MR', host[1]) >= .80) { ns.exec(files[0], host[1], tmp[1], target) }
				if (tmp[0] > 0 && fRam() / info('MR', host[1]) >= .15) { ns.exec(files[1], host[1], tmp[0], target) }
			}
			if (!loop) { if (hType == 0) { act[target] = 'G' }; if (hType == 1) { act[target] = 'W' }; if (hType == 2) { act[target] = 'H' }; }
			tarIndex++;
		}
	}
	//MODULES BELOW HERE
	// netManager = await ns.prompt('Activate Hacknet Manager?');//MG:OFF
	async function hnManager() {
		if (checkM(ns.hacknet.getPurchaseNodeCost(), 20)) { ns.hacknet.purchaseNode() }
		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			for (let part of ['Level', 'Ram', 'Core']) {
				if (checkM(ns.hacknet['get' + part + 'UpgradeCost'](i), 20)) {
					ns.hacknet['upgrade' + part](i);
				}
			}
		}
	}
	// serverManager = await ns.prompt('Activate Player Server Manager?');//MG:OFF
	async function pServerManager() {
		let ram = 0; let ramList = [8]; for (let num of ramList) {
			if (num <= 1048576 && checkM(ns.getPurchasedServerCost(num), 20)) { ramList.push(num * 2); ram = num; } else { break };
		}
		function buyServer(r) { ns.purchaseServer('SERVER-' + ns.nFormat(r * 1000000000, '0.0b'), r) }
		if (ns.getPurchasedServers().length < 25 && ram > 0) { buyServer(ram) }
		for (let i = ns.getPurchasedServers().length - 1; i >= 0; i--) {
			tmp = ns.getPurchasedServers()[i]
			if (info('MR', tmp) < ram && checkM(ns.getPurchasedServerCost(ram), 20) && !exclude.includes(tmp)) {
				ns.killall(tmp); ns.deleteServer(tmp); buyServer(ram);
			}
		}
	}
	//MODULES ABOVE HERE
	ns.tail()
	while (true) {//Keeps everything running once per second
		servers = []; targets = []; hosts = [[Math.max(info('MR', 'home') - 50, 0), 'home']]; exes = []
		tarIndex = 0; loop = false; act = {}
		ns.clearLog()
		await scanExes()
		await scanServers('', 'home')
		await hackAll()

		// ns.print('test')

		if (ns.getPlayer().hasCorporation) {
			serverManager = true
			netManager = true
		} else {
			ns.print('STATUS:\n',
				'Awaiting Corporation to enable serverManager and netManager')
			serverManager = false
			netManager = false
		}

		// serverManager = false



		if (netManager) { await hnManager() }
		// if (ns.args[0]=='on') { await hnManager() }

		if (serverManager) { await pServerManager() }
		// if (ns.args[1]=='on') { await pServerManager() }
		// await pServerManager()
		log()
		await ns.asleep(1000)
	}
}
