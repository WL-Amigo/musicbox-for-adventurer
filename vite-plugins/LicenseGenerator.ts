import { Plugin } from 'vite';
import { readJson } from 'fs-extra';
import { LicenseItem } from '../src/model/License';
import LicenseChecker from 'license-checker';

const ModuleName = 'virtual:licenses';

type Package = {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
};

type License = {
  licenses: string;
  repository?: string;
  url?: string;
};

const resolveLicenses = (licenses: string | string[]) =>
  typeof licenses === 'string' ? licenses : licenses.join(', ');

export const LicenseGeneratorPlugin = (): Plugin => {
  return {
    name: 'license-generator',
    resolveId(id) {
      if (id === ModuleName) {
        return ModuleName;
      }
    },
    async load(id) {
      if (id !== ModuleName) {
        return undefined;
      }

      const allLicensesRaw = await new Promise<LicenseChecker.ModuleInfos>((res, rej) => {
        LicenseChecker.init(
          {
            start: process.cwd(),
          },
          (err, packages) => {
            if (err) {
              rej(err);
            } else {
              res(packages);
            }
          },
        );
      });
      const allLicenses = new Map<string, License>(
        Object.entries(allLicensesRaw).map<[string, License]>(([packageName, moduleInfo]) => [
          packageName.slice(0, packageName.lastIndexOf('@')),
          {
            licenses: resolveLicenses(moduleInfo.licenses),
            repository: moduleInfo.repository,
            url: moduleInfo.url,
          },
        ]),
      );

      const packageObj: Package = await readJson('./package.json');
      const deps = Object.entries(packageObj.dependencies).concat(Object.entries(packageObj.devDependencies));
      const result: LicenseItem[] = [];

      for (const [d, v] of deps) {
        let depKey = d;
        if (v.startsWith('npm:')) {
          depKey = v.slice(0, v.lastIndexOf('@')).replace('npm:', '');
        }
        const license = allLicenses.get(depKey);
        if (license === undefined) {
          throw new Error(`次のパッケージのライセンス情報を発見できませんでした: ${d}(${depKey})`);
        }
        const item: LicenseItem = {
          name: d,
          license: license.licenses,
          url: license.repository ?? license.url ?? '',
          category: 'dependency',
        };
        result.push(item);
      }

      return `export const Licenses = ${JSON.stringify(result)}; export default Licenses;`;
    },
  };
};
