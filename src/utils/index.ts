import {workspace,Location,Uri,Position} from "vscode";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

// 获取文件所在工作空间的根目录
export const getFileInProjectRootDir = function (
  filepath: string
): string | undefined {
  const project = workspace.workspaceFolders?.find((project) => {
    return filepath.startsWith(project.uri.path);
  });
  return project?.uri.path;
};

// 判断是否是monorepo项目
export const isMonorepoProject = (projectRootDir: string) => {
  // TODO: 暂时先这么判断
  const lernaJsonPath = join(projectRootDir, "lerna.json");
  let isLerna = existsSync(lernaJsonPath);
  let yarnworkspaces = false;
  const pkgjsonPath = join(projectRootDir, "package.json");
  if (existsSync(pkgjsonPath)) {
    const pkgBuffer = readFileSync(pkgjsonPath);
    try {
      const pkgJson = JSON.parse(pkgBuffer.toString());
      yarnworkspaces = Boolean(pkgJson.workspaces);
    } catch (err) {
      error("root package.json parse error", err);
    }
  }
  return isLerna || yarnworkspaces;
};

// 生成 vscode.location对象 用来让vscode跳转到指定文件的指定位置
export const genFileLocation = (
  destPath: string,
  line: number = 0,
  character: number = 0
) => {
  // new vscode.Position(0, 0) 表示跳转到某个文件的第一行第一列
  return new Location(
    Uri.file(destPath),
    new Position(line, character)
  );
};

export function error(msg: string, err?: any) {
  console.error(`[node_modules extension]: ${msg}. \n${err}`);
}

export function promiseAny<T>(promiseList: Promise<T>[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    if(!(Array.isArray(promiseList) && promiseList.length >0)){
      resolve([]);
      return;
    }
    let count = 0;
    const result: T[] = new Array(promiseList.length);
    promiseList.forEach((promise, index) => {
      promise
        .then(
          (res) => {
            result[index] = res;
          },
          (err) => {
            result[index] = err;
          }
        )
        .finally(() => {
          if (++count === promiseList.length) {
            resolve(result);
          }
        });
    });
  });
}