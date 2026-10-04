import { mkdir, writeFile } from 'node:fs/promises'
import {
  eligibleLookupTables,
  lookupTypeName,
  lookupTypeValues,
} from '../shared/conventions.ts'
import type { SolutionLoadResult, TableMapping } from '../shared/types.ts'
import { writeEnumFile } from './auditEnums.ts'
import {
  lookupControllerFilePath,
  lookupTypeFilePath,
} from './auditLookups.ts'
import { camelName } from './csharpTypes.ts'
import { loadSolution } from './loadSolution.ts'
import { projectFolders, webApiFolders } from './projectPaths.ts'
import { collapseExcessBlankLines } from './sourceFormat.ts'

export async function writeLookupBag(
  solutionPath: string,
): Promise<SolutionLoadResult> {
  const loaded = await loadSolution(solutionPath)
  if (loaded.error && !loaded.tables) return loaded
  if (!loaded.namespace) {
    return {
      ...loaded,
      error: loaded.error ?? 'Unable to determine the project namespace.',
    }
  }

  const folders = projectFolders(loaded)
  if (!folders) {
    return {
      ...loaded,
      error: 'Could not determine the Business project folders.',
    }
  }

  await writeEnumFile(
    lookupTypeFilePath(folders.enumsFolder),
    loaded.namespace,
    'LookupType',
    lookupTypeValues(loaded.tables ?? []),
  )

  const apiFolders = webApiFolders(loaded)
  if (apiFolders) {
    await mkdir(apiFolders.controllersFolder, { recursive: true })
    await writeFile(
      lookupControllerFilePath(apiFolders.controllersFolder),
      renderLookupController(loaded.namespace, loaded.tables ?? []),
      'utf8',
    )
  }

  return loadSolution(solutionPath)
}

export async function fixLookups(
  solutionPath: string,
): Promise<SolutionLoadResult> {
  return writeLookupBag(solutionPath)
}

export function renderLookupController(
  nameSpace: string,
  tables: TableMapping[],
): string {
  const lookups = eligibleLookupTables(tables)
  const fields = lookups.map((table) => {
    const serviceName = table.serviceName!
    return {
      typeName: lookupTypeName(table),
      serviceName,
      field: `_${camelName(serviceName)}`,
      param: camelName(serviceName),
    }
  })

  const serviceFields = fields
    .map(
      (entry) =>
        `    private readonly ${entry.serviceName} ${entry.field};`,
    )
    .join('\n')

  const ctorParams = [
    '        ILogger<LookupController> logger',
    ...fields.map(
      (entry) => `        ${entry.serviceName} ${entry.param}`,
    ),
  ].join(',\n')

  const ctorAssignments = [
    '        _logger = logger;',
    ...fields.map((entry) => `        ${entry.field} = ${entry.param};`),
  ].join('\n')

  const allBody =
    fields.length === 0
      ? `        await Task.CompletedTask;
        List<LookupModel> models = [];
        return Ok(models);`
      : `        List<LookupModel> models = [
${fields
  .map(
    (entry) =>
      `            LookupModel.Create(await ${entry.field}.CachedGetAllAsync())`,
  )
  .join(',\n')}
        ];
        return Ok(models);`

  const typeCases =
    fields.length === 0
      ? `            case LookupType.Unknown:
            default:
                return BadRequest("Unknown Lookup Type provided.");`
      : `${fields
          .map(
            (entry) =>
              `            case LookupType.${entry.typeName}:
                return Ok(LookupModel.Create(await ${entry.field}.CachedGetAllAsync()));`,
          )
          .join('\n')}
            case LookupType.Unknown:
            default:
                return BadRequest("Unknown Lookup Type provided.");`

  return collapseExcessBlankLines(`using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ${nameSpace}.Business;
using ${nameSpace}.SpaModels;

namespace ${nameSpace}.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
[ProducesResponseType(typeof(ApiError), 400)]
[ProducesResponseType(typeof(ApiError), 401)]
[ProducesResponseType(typeof(ApiError), 404)]
[ProducesResponseType(typeof(ApiError), 500)]
public class LookupController : ControllerBase
{
    private readonly ILogger<LookupController> _logger;
${serviceFields}

    public LookupController(
${ctorParams})
    {
${ctorAssignments}
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LookupModel>), 200)]
    public async Task<ActionResult> All()
    {
${allBody}
    }

    [HttpGet("type/{lookupType}")]
    [ProducesResponseType(typeof(LookupModel), 200)]
    public async Task<ActionResult> Type(LookupType lookupType)
    {
${fields.length === 0 ? '        await Task.CompletedTask;\n' : ''}        switch (lookupType)
        {
${typeCases}
        }
    }
}
`)
}
