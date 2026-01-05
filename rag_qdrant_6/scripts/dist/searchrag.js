//@ts-ignore
import { parseArgs } from 'node:util';
//@ts-ignore
import { spawn } from "child_process";
// コレクション名
const COLLECT_NAME = "document-2";
class RpcClient {
    constructor(command) {
        //@ts-ignore
        this.proc = spawn(command);
        //@ts-ignore
        this.idCounter = 1;
        //@ts-ignore
        this.pending = new Map();
        //@ts-ignore
        this.proc.stdout.setEncoding("utf8");
        //@ts-ignore
        this.proc.stdout.on("data", (data) => this._handleData(data));
        //@ts-ignore
        this.proc.stderr.on("data", (err) => {
            //console.error("Rust stderr:", err.toString())
        });
        //@ts-ignore
        this.proc.on("exit", (code) => {
            //console.log(`Rust server exited (${code})`)
        });
    }
    _handleData(data) {
        // 複数行対応
        data.split("\n").forEach((line) => {
            //console.log("line=", line)
            if (!line.trim())
                return;
            try {
                const msg = JSON.parse(line);
                //@ts-ignore
                if (msg.id && this.pending.has(msg.id)) {
                    //@ts-ignore
                    const { resolve } = this.pending.get(msg.id);
                    //@ts-ignore
                    this.pending.delete(msg.id);
                    //@ts-ignore
                    resolve(msg.result);
                }
            }
            catch (e) {
                //console.error("JSON parse error:", e, line);
            }
        });
    }
    call(method, params = {}) {
        //@ts-ignore
        const id = this.idCounter++;
        const payload = {
            jsonrpc: "2.0",
            id,
            method,
            params,
        };
        return new Promise((resolve, reject) => {
            //@ts-ignore
            this.pending.set(id, { resolve, reject });
            //@ts-ignore
            this.proc.stdin.write(JSON.stringify(payload) + "\n");
        });
    }
    close() {
        //@ts-ignore
        this.proc.kill();
    }
}
/**
*
* @param
*
* @return
*/
const main = async function () {
    const options = {
        // 受け取りたい引数の定義
        message: {
            type: 'string', // 文字列として受け取る
            short: 'm', // -m でも受け取れる
        },
    };
    //@ts-ignore
    const { values } = parseArgs({ options });
    // 実行結果の確認
    const query = values.message;
    //console.log("query=", query)
    //RpcClient
    const client = new RpcClient("/work/rust/extra/qdrant_6/target/debug/rust_qdrant_6.exe");
    const result1 = await client.call("tools/call", {
        name: "rag_search",
        arguments: {
            query: query,
        }
    });
    client.close();
    //console.log("resp=", result1);
    //@ts-ignore
    if (result1.content[0].text) {
        //@ts-ignore
        //console.log("text:"+ result1.content[0].text);
        console.log(result1.content[0].text);
    }
};
main();
//# sourceMappingURL=searchrag.js.map