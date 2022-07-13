# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode. Will open a electron window.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run make`

Builds the app for production, creating an electron distributable.

## Análise técnica
Sequencia de Atividades
- Solicitar para usuário seu nome de usuário e senha;
- Solicitar para o usuário qual o projeto que ele deseja gerar o gráfico;
- Obter a lista de boards usando o projeto informado;
  - https://jiraproducao.totvs.com.br/rest/agile/1.0/board?projectKeyOrId={projectKey}
- Usuário seleciona o board a ser utilizado;
- Obter a lista de sprints usando a board selecionada;
  - https://jiraproducao.totvs.com.br/rest/agile/1.0/board/:boardId/sprint?maxResults={50}&startAt={0}
	- Deve ser paginado até que a propriedade isLast seja true.
  - Apresentar select templatizado com nome da Sprint, status (active, closed, future), start date, end-date. Ordenar por status (Future -> Active -> Closed) e start date (mais recentes primeiros)
	- Infelizmente não é possivel saber o número total de registros, logo deve ser feito uma sequencia de fetchs até que todas as Sprints sejam obtidas e listar todas elas no select;
	- Para ordenação basta fazer reverse do array;
	- O número máximo de registros por página é de 50;
- Usuário seleciona a Sprint a ter o gráfico gerado;
- Obter a lista de issues da sprint;
  - https://jiraproducao.totvs.com.br/rest/agile/1.0/board/:boardId/sprint/:sprintId/issue?maxResults=50&startAt=0&fields=resolution,aggregatetimeoriginalestimate,assignee,subtasks,closedSprints,issuetype,timetracking,status,timespent,aggregatetimespent,flagged,labels,components,reporter,summary,epic,priority,created
	- Já é retornado a lista de subtasks
- Para cada subtask de cada issue, obter suas informações
    - https://jiraproducao.totvs.com.br/rest/api/2/issue/:issueId?expand=changelog&fields=resolution,aggregatetimeoriginalestimate,assignee,issuetype,timetracking,status,timespent,labels,components,reporter,timeoriginalestimate,summary,priority,created
- Na subtask obtida, se ela não possuir resolution (i.e. resolution = null), considerar como parte da Sprint;
- Se possuir resolution, obter o "resolutiondate" para determinar se esta dentro da Sprint (comparar datas). Se estiver, faz parte da Sprint, se não, excluir da Sprint.
- Para definir a data de inclusão na Sprint para montar o gráfico:
  - Verificar se no changelog possui transferência de issue pai.
	- Olhar no campo histories (changelog.histories) se algum item, dentro da propriedade items (changelog.histories.items), possui o valor field: "Parent Issue" (changelog.histories.items.field), denotando assim uma transferência da subtask de um pai para o outro. 
	- Se possuir, então olhar para o campo created (changelog.histories.created) e usar esta data como data de adição na sprint. 
	- Se existir múltiplas transferências de pai, usar a última data (changelog.histories.created)
  - Se não possuir changelog de mudança de pai, usar o campo "created" (fields.created)
- Com isso acredito que temos todos os dados necessário para montar uma matriz de dados para geração do Burndown.
  - Lógica para elaborar a matriz de dados a ser utilizada no gráfico de burndow
    - TODO...
  - Utilizar um pacote para gerar gráficos...
		
	
