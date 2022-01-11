import typer
from typer.main import Typer


app: Typer = typer.Typer()


@app.command()
def create():
    typer.echo("Creating user: Hiro Hamada")


@app.command()
def delete():
    typer.echo("Deleting user: Hiro Hamada")

if __name__ == "__main__":
    app()
